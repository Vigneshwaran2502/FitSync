import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Dumbbell,
  Calendar,
  Clock,
  Plus,
  BookOpen,
  ArrowRight
} from "lucide-react";
import { reportApi } from "../../api/reportApi";
import { appointmentApi } from "../../api/appointmentApi";
import { StatCard } from "../../components/common/StatCard";
import { Badge } from "../../components/common/Badge";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
const TrainerDashboard = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const res = await reportApi.getTrainerStats();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchStats();
  }, []);
  const handleUpdateAppointment = async (id, status) => {
    try {
      await appointmentApi.updateStatus(id, status);
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || "Error updating appointment");
    }
  };
  if (isLoading) {
    return <LoadingSpinner message="Loading trainer roster and coaching metrics..." />;
  }
  const { cards, todayAppointments, recentLogs } = data || {};
  return <div className="space-y-6">
      {
    /* Header and Quick Actions */
  }
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#15131D] dark:text-white tracking-tight">Trainer Coaching Hub</h1>
          <p className="text-xs text-[#686476] dark:text-slate-400 mt-1">Manage your assigned client roster, workout plans, and scheduled training</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
    onClick={() => navigate("/trainer/workout-plans")}
    className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl shadow-md shadow-purple-600/25 transition-all cursor-pointer"
  >
            <Plus className="w-4 h-4" />
            <span>Create Plan</span>
          </button>
          <button
    onClick={() => navigate("/trainer/exercises")}
    className="flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold text-[#15131D] dark:text-slate-200 bg-white dark:bg-slate-900 border border-[#E8E5EE] dark:border-slate-800 hover:border-purple-500/50 rounded-xl shadow-xs transition-all cursor-pointer"
  >
            <BookOpen className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>Add Exercise</span>
          </button>
          <button
    onClick={() => navigate("/trainer/availability")}
    className="flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold text-[#15131D] dark:text-slate-200 bg-white dark:bg-slate-900 border border-[#E8E5EE] dark:border-slate-800 hover:border-purple-500/50 rounded-xl shadow-xs transition-all cursor-pointer"
  >
            <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>Availability</span>
          </button>
        </div>
      </div>

      {
    /* 4 Stat Cards */
  }
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
    title="Assigned Clients"
    value={cards?.assignedMembersCount || 0}
    subtitle="Active member athletes"
    icon={Users}
    onClick={() => navigate("/trainer/members")}
  />
        <StatCard
    title="Active Programs"
    value={cards?.activeWorkoutPlans || 0}
    subtitle="Prescribed workout routines"
    icon={Dumbbell}
    onClick={() => navigate("/trainer/workout-plans")}
  />
        <StatCard
    title="Today's Sessions"
    value={cards?.todayAppointmentsCount || 0}
    subtitle="Consultations scheduled today"
    icon={Calendar}
    onClick={() => navigate("/trainer/appointments")}
  />
        <StatCard
    title="Upcoming Bookings"
    value={cards?.upcomingAppointmentsCount || 0}
    subtitle="Confirmed future consultations"
    icon={Clock}
    onClick={() => navigate("/trainer/appointments")}
  />
      </div>

      {
    /* Grid: Today's Appointments & Recent Workout Logs */
  }
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {
    /* Today's Appointments */
  }
        <div className="bg-white dark:bg-[#0b0d15] border border-[#E8E5EE] dark:border-slate-800 rounded-3xl p-6 shadow-[0_10px_30px_rgba(30,20,60,0.04)] dark:shadow-none theme-transition">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-[#15131D] dark:text-white">Today&apos;s Training Sessions</h2>
              <p className="text-xs text-[#686476] dark:text-slate-400">1-on-1 coaching consultations</p>
            </div>
            <button
    onClick={() => navigate("/trainer/appointments")}
    className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
  >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {!todayAppointments || todayAppointments.length === 0 ? <p className="text-xs text-[#8E8A9C] dark:text-slate-400 py-6 text-center italic">No sessions booked for today.</p> : <div className="divide-y divide-[#E8E5EE] dark:divide-slate-800/80">
              {todayAppointments.map((apt) => <div key={apt._id} className="py-3.5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-[#15131D] dark:text-white">{apt.memberId?.name}</p>
                    <p className="text-[11px] text-[#686476] dark:text-slate-400">{apt.topic || "Training Session"}</p>
                    <p className="text-[10px] font-mono text-purple-600 dark:text-purple-400 font-bold mt-0.5">
                      {apt.startTime} – {apt.endTime}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge status={apt.status} />
                    {apt.status === "pending" && <button
    onClick={() => handleUpdateAppointment(apt._id, "confirmed")}
    className="px-2.5 py-1 bg-purple-600 text-white rounded-xl text-[11px] font-bold hover:bg-purple-500 transition-colors shadow-2xs cursor-pointer"
  >
                        Confirm
                      </button>}
                  </div>
                </div>)}
            </div>}
        </div>

        {
    /* Member Workout Performance Logs */
  }
        <div className="bg-white dark:bg-[#0b0d15] border border-[#E8E5EE] dark:border-slate-800 rounded-3xl p-6 shadow-[0_10px_30px_rgba(30,20,60,0.04)] dark:shadow-none theme-transition">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-[#15131D] dark:text-white">Recent Client Workout Logs</h2>
              <p className="text-xs text-[#686476] dark:text-slate-400">Actual performance reported by members</p>
            </div>
            <button
    onClick={() => navigate("/trainer/members")}
    className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
  >
              <span>Members</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {!recentLogs || recentLogs.length === 0 ? <p className="text-xs text-[#8E8A9C] dark:text-slate-400 py-6 text-center italic">No recent workout logs.</p> : <div className="divide-y divide-[#E8E5EE] dark:divide-slate-800/80">
              {recentLogs.map((log) => <div key={log._id} className="py-3.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-[#15131D] dark:text-white">{log.memberId?.name}</span>
                    <p className="text-[11px] text-purple-700 dark:text-purple-400 font-medium">{log.exerciseId?.name}</p>
                    <p className="text-[10px] text-[#8E8A9C] dark:text-slate-400 tabular-nums font-mono">{log.date}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-[#15131D] dark:text-white tabular-nums">
                      {log.setsCompleted} sets × {log.repsCompleted} reps
                    </span>
                    {log.weightUsedKg > 0 && <p className="text-[11px] font-mono text-purple-600 dark:text-purple-400 font-bold">{log.weightUsedKg} kg</p>}
                  </div>
                </div>)}
            </div>}
        </div>
      </div>
    </div>;
};
export {
  TrainerDashboard
};
