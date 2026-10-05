import { useState, useEffect } from "react";
import { Plus, CheckCircle2, X, Calendar } from "lucide-react";
import { appointmentApi } from "../../api/appointmentApi";
import { trainerApi } from "../../api/trainerApi";
import { Badge } from "../../components/common/Badge";
import { Modal } from "../../components/common/Modal";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
const TIME_SLOTS = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00"
];
const MemberAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [startTime, setStartTime] = useState("10:00");
  const [topic, setTopic] = useState("Personal Training Consultation");
  const [notes, setNotes] = useState("");
  const [isBooking, setIsBooking] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      const [aptRes, trainRes] = await Promise.all([
        appointmentApi.getAppointments(),
        trainerApi.getTrainers()
      ]);
      setAppointments(aptRes.appointments || []);
      setTrainers(trainRes.trainers || []);
      if (trainRes.trainers?.length > 0) {
        setSelectedTrainer(trainRes.trainers[0]._id);
      }
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1e3).toISOString().split("T")[0];
      setBookingDate(tomorrow);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchAppointments();
  }, []);
  const handleBookSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTrainer || !bookingDate || !startTime) return;
    const hour = parseInt(startTime.split(":")[0], 10) + 1;
    const endTime = `${String(hour).padStart(2, "0")}:${startTime.split(":")[1]}`;
    try {
      setIsBooking(true);
      await appointmentApi.createAppointment({
        trainerId: selectedTrainer,
        date: bookingDate,
        startTime,
        endTime,
        topic,
        notes
      });
      setIsBookModalOpen(false);
      setFeedback("Session booking request sent to trainer!");
      setTimeout(() => setFeedback(null), 4e3);
      fetchAppointments();
    } catch (err) {
      alert(err.response?.data?.message || "Error booking appointment");
    } finally {
      setIsBooking(false);
    }
  };
  const handleCancel = async (id) => {
    if (!confirm("Cancel this scheduled appointment?")) return;
    try {
      await appointmentApi.cancelAppointment(id);
      fetchAppointments();
    } catch (err) {
      alert(err.response?.data?.message || "Error cancelling appointment");
    }
  };
  return <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#15131D] dark:text-white tracking-tight">Trainer Consultations</h1>
          <p className="text-xs text-[#686476] dark:text-slate-400 mt-1">Book 1-on-1 technique assessment and personal training sessions</p>
        </div>

        <button
    onClick={() => setIsBookModalOpen(true)}
    className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl shadow-md shadow-purple-600/25 transition-all cursor-pointer self-start sm:self-auto"
  >
          <Plus className="w-4 h-4" />
          <span>Book Consultation</span>
        </button>
      </div>

      {feedback && <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 rounded-2xl text-xs font-semibold flex items-center gap-2 theme-transition">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{feedback}</span>
        </div>}

      {
    /* Appointments List */
  }
      <div className="bg-white dark:bg-[#0b0d15] border border-[#E8E5EE] dark:border-slate-800 rounded-3xl overflow-hidden shadow-[0_10px_30px_rgba(30,20,60,0.04)] dark:shadow-none theme-transition">
        {isLoading ? <LoadingSpinner message="Retrieving your consultation calendar..." /> : appointments.length === 0 ? <div className="p-10 text-center">
            <Calendar className="w-10 h-10 text-purple-300 dark:text-purple-800 mx-auto mb-2" />
            <p className="text-xs text-[#8E8A9C] dark:text-slate-400">No appointments scheduled.</p>
          </div> : <div className="divide-y divide-[#E8E5EE] dark:divide-slate-800/80">
            {appointments.map((apt) => <div key={apt._id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 dark:hover:bg-slate-900/60 transition-colors">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-[#15131D] dark:text-white text-sm">{apt.topic}</span>
                    <Badge status={apt.status} />
                  </div>
                  <p className="text-xs text-[#686476] dark:text-slate-300">
                    Coach: <strong className="text-[#15131D] dark:text-white">{apt.trainerId?.name}</strong>
                  </p>
                  <p className="text-[11px] font-mono text-purple-600 dark:text-purple-400 font-bold mt-1">
                    {apt.date} · {apt.startTime}–{apt.endTime}
                  </p>
                  {apt.notes && <p className="text-[11px] text-[#8E8A9C] dark:text-slate-400 italic mt-1">{apt.notes}</p>}
                </div>

                {apt.status === "pending" && <button
    onClick={() => handleCancel(apt._id)}
    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-xl transition-colors cursor-pointer self-start sm:self-auto"
  >
                    <X className="w-3.5 h-3.5" />
                    <span>Cancel Request</span>
                  </button>}
              </div>)}
          </div>}
      </div>

      {
    /* Book Consultation Modal */
  }
      <Modal
    isOpen={isBookModalOpen}
    onClose={() => setIsBookModalOpen(false)}
    title="Book Trainer Consultation"
    subtitle="Schedule a dedicated 1-on-1 coaching session"
  >
        <form onSubmit={handleBookSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-[#15131D] dark:text-white mb-1.5">Select Coach</label>
            <select
    value={selectedTrainer}
    onChange={(e) => setSelectedTrainer(e.target.value)}
    className="w-full px-3.5 py-2.5 border border-[#E8E5EE] dark:border-slate-800 rounded-xl bg-[#F8F7FA] dark:bg-slate-900 text-[#15131D] dark:text-white focus:outline-hidden focus:border-purple-600"
  >
              {trainers.map((t) => <option key={t._id} value={t._id}>
                  {t.name} {t.trainerProfile?.specialization && `(${t.trainerProfile.specialization.join(", ")})`}
                </option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#15131D] dark:text-white mb-1.5">Session Date</label>
              <input
    type="date"
    required
    value={bookingDate}
    onChange={(e) => setBookingDate(e.target.value)}
    className="w-full px-3.5 py-2.5 border border-[#E8E5EE] dark:border-slate-800 rounded-xl bg-[#F8F7FA] dark:bg-slate-900 text-[#15131D] dark:text-white focus:outline-hidden focus:border-purple-600"
  />
            </div>
            <div>
              <label className="block font-bold text-[#15131D] dark:text-white mb-1.5">Start Time</label>
              <select
    value={startTime}
    onChange={(e) => setStartTime(e.target.value)}
    className="w-full px-3.5 py-2.5 border border-[#E8E5EE] dark:border-slate-800 rounded-xl bg-[#F8F7FA] dark:bg-slate-900 text-[#15131D] dark:text-white font-mono focus:outline-hidden focus:border-purple-600"
  >
                {TIME_SLOTS.map((slot) => <option key={slot} value={slot}>{slot}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-[#15131D] dark:text-white mb-1.5">Consultation Topic</label>
            <input
    type="text"
    required
    value={topic}
    onChange={(e) => setTopic(e.target.value)}
    placeholder="e.g. Squat Mechanics Assessment, Diet Review"
    className="w-full px-3.5 py-2.5 border border-[#E8E5EE] dark:border-slate-800 rounded-xl bg-[#F8F7FA] dark:bg-slate-900 text-[#15131D] dark:text-white focus:outline-hidden focus:border-purple-600"
  />
          </div>

          <div>
            <label className="block font-bold text-[#15131D] dark:text-white mb-1.5">Notes for Coach (Optional)</label>
            <textarea
    rows={3}
    value={notes}
    onChange={(e) => setNotes(e.target.value)}
    placeholder="Mention any specific goals, soreness, or questions..."
    className="w-full px-3.5 py-2.5 border border-[#E8E5EE] dark:border-slate-800 rounded-xl bg-[#F8F7FA] dark:bg-slate-900 text-[#15131D] dark:text-white focus:outline-hidden focus:border-purple-600 leading-relaxed"
  />
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <button
    type="button"
    onClick={() => setIsBookModalOpen(false)}
    className="px-4 py-2 font-bold text-xs text-[#686476] dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
  >
              Cancel
            </button>
            <button
    type="submit"
    disabled={isBooking}
    className="px-5 py-2.5 font-bold text-xs text-white bg-purple-600 hover:bg-purple-500 disabled:opacity-60 rounded-xl shadow-md shadow-purple-600/25 transition-all cursor-pointer"
  >
              {isBooking ? "Reserving..." : "Send Booking Request"}
            </button>
          </div>
        </form>
      </Modal>
    </div>;
};
export {
  MemberAppointments
};
