import { useState, useEffect } from "react";
import { Filter } from "lucide-react";
import { appointmentApi } from "../../api/appointmentApi";
import { Badge } from "../../components/common/Badge";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { EmptyState } from "../../components/common/EmptyState";
const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      const params = {};
      if (statusFilter !== "all") params.status = statusFilter;
      const res = await appointmentApi.getAppointments(params);
      setAppointments(res.appointments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchAppointments();
  }, [statusFilter]);
  const handleUpdateStatus = async (id, status) => {
    try {
      await appointmentApi.updateStatus(id, status);
      fetchAppointments();
    } catch (err) {
      alert(err.response?.data?.message || "Error updating status");
    }
  };
  return <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#15131D] dark:text-white tracking-tight">Facility Appointment Master Schedule</h1>
          <p className="text-xs text-[#686476] dark:text-slate-400 mt-1">Comprehensive audit of 1-on-1 trainer consultations and bookings</p>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[#8E8A9C]" />
          <select
    value={statusFilter}
    onChange={(e) => setStatusFilter(e.target.value)}
    className="px-3 py-2 text-xs border border-[#E8E5EE] dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-[#15131D] dark:text-white focus:outline-hidden focus:border-purple-600 theme-transition"
  >
            <option value="all">All Bookings</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0b0d15] border border-[#E8E5EE] dark:border-slate-800 rounded-3xl overflow-hidden shadow-[0_10px_30px_rgba(30,20,60,0.04)] dark:shadow-none theme-transition">
        {isLoading ? <LoadingSpinner message="Auditing appointment schedule..." /> : appointments.length === 0 ? <EmptyState
    title="No appointments found"
    description="No consultations match the selected status filters."
  /> : <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F7FA] dark:bg-slate-950/80 border-b border-[#E8E5EE] dark:border-slate-800 text-[#686476] dark:text-slate-400 font-bold uppercase text-[11px] tracking-wider theme-transition">
                <tr>
                  <th className="px-6 py-4">Session / Topic</th>
                  <th className="px-6 py-4">Member</th>
                  <th className="px-6 py-4">Trainer</th>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Administrative Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E5EE] dark:divide-slate-800/80">
                {appointments.map((apt) => <tr key={apt._id} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/60 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-[#15131D] dark:text-white">{apt.topic || "Training Session"}</p>
                      {apt.notes && <p className="text-[11px] text-[#8E8A9C] dark:text-slate-400 italic line-clamp-1">{apt.notes}</p>}
                    </td>
                    <td className="px-6 py-4 font-medium text-[#15131D] dark:text-white">{apt.memberId?.name}</td>
                    <td className="px-6 py-4 text-purple-600 dark:text-purple-400 font-bold">{apt.trainerId?.name}</td>
                    <td className="px-6 py-4 font-mono text-[#686476] dark:text-slate-300 tabular-nums">
                      {apt.date} · {apt.startTime}–{apt.endTime}
                    </td>
                    <td className="px-6 py-4">
                      <Badge status={apt.status} />
                    </td>
                    <td className="px-6 py-4 text-right space-x-1.5">
                      {apt.status === "pending" && <>
                          <button
    onClick={() => handleUpdateStatus(apt._id, "confirmed")}
    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
  >
                            Confirm
                          </button>
                          <button
    onClick={() => handleUpdateStatus(apt._id, "cancelled")}
    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#686476] dark:text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
  >
                            Decline
                          </button>
                        </>}
                      {apt.status === "confirmed" && <button
    onClick={() => handleUpdateStatus(apt._id, "completed")}
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
  AdminAppointments
};
