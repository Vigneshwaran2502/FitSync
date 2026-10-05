import { useState, useEffect } from "react";
import { appointmentApi } from "../../api/appointmentApi";
import { Badge } from "../../components/common/Badge";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { EmptyState } from "../../components/common/EmptyState";
const TrainerAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      const res = await appointmentApi.getAppointments();
      setAppointments(res.appointments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchAppointments();
  }, []);
  const handleStatus = async (id, status) => {
    try {
      await appointmentApi.updateStatus(id, status);
      fetchAppointments();
    } catch (err) {
      alert(err.response?.data?.message || "Error updating status");
    }
  };
  return <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#15131D] dark:text-white tracking-tight">Coaching Consultation Calendar</h1>
        <p className="text-xs text-[#686476] dark:text-slate-400 mt-1">Accept member session bookings, review topics, and track completion</p>
      </div>

      <div className="bg-white dark:bg-[#0b0d15] border border-[#E8E5EE] dark:border-slate-800 rounded-3xl overflow-hidden shadow-[0_10px_30px_rgba(30,20,60,0.04)] dark:shadow-none theme-transition">
        {isLoading ? <LoadingSpinner message="Loading your coaching sessions..." /> : appointments.length === 0 ? <EmptyState
    title="No appointments scheduled"
    description="When athletes book consultations during your active hours, they will appear here."
  /> : <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F7FA] dark:bg-slate-950/80 border-b border-[#E8E5EE] dark:border-slate-800 text-[#686476] dark:text-slate-400 font-bold uppercase text-[11px] tracking-wider theme-transition">
                <tr>
                  <th className="px-6 py-4">Athlete</th>
                  <th className="px-6 py-4">Topic / Focus</th>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">Notes</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E5EE] dark:divide-slate-800/80">
                {appointments.map((apt) => <tr key={apt._id} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/60 transition-colors">
                    <td className="px-6 py-4 font-bold text-[#15131D] dark:text-white">
                      <div>
                        <p>{apt.memberId?.name}</p>
                        <p className="text-[11px] text-[#8E8A9C] dark:text-slate-400 font-normal">{apt.memberId?.phone || apt.memberId?.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[#15131D] dark:text-slate-200 font-medium">{apt.topic}</td>
                    <td className="px-6 py-4 font-mono text-[#686476] dark:text-slate-300 tabular-nums">
                      {apt.date} · {apt.startTime}–{apt.endTime}
                    </td>
                    <td className="px-6 py-4 text-[#8E8A9C] dark:text-slate-400 italic max-w-xs truncate">{apt.notes || "\u2014"}</td>
                    <td className="px-6 py-4">
                      <Badge status={apt.status} />
                    </td>
                    <td className="px-6 py-4 text-right space-x-1.5">
                      {apt.status === "pending" && <>
                          <button
    onClick={() => handleStatus(apt._id, "confirmed")}
    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
  >
                            Accept
                          </button>
                          <button
    onClick={() => handleStatus(apt._id, "rejected")}
    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#686476] dark:text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
  >
                            Decline
                          </button>
                        </>}
                      {apt.status === "confirmed" && <button
    onClick={() => handleStatus(apt._id, "completed")}
    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
  >
                          Mark Completed
                        </button>}
                    </td>
                  </tr>)}
              </tbody>
            </table>
          </div>}
      </div>
    </div>;
};
export {
  TrainerAppointments
};
