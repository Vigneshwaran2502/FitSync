import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CreditCard,
  Dumbbell,
  CheckCircle2,
  Award,
  ArrowRight,
  QrCode,
  Scale,
  Activity
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import { progressApi } from "../../api/progressApi";
import { workoutApi } from "../../api/workoutApi";
import { subscriptionApi } from "../../api/subscriptionApi";
import { appointmentApi } from "../../api/appointmentApi";
import { StatCard } from "../../components/common/StatCard";
import { Badge } from "../../components/common/Badge";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
const MemberDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [todayWorkout, setTodayWorkout] = useState(null);
  const [activeSub, setActiveSub] = useState(null);
  const [upcomingApt, setUpcomingApt] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const fetchDashboard = async () => {
    try {
      setIsLoading(true);
      const [progRes, workoutRes, subRes, aptRes] = await Promise.all([
        progressApi.getProgressDashboard(),
        workoutApi.getTodayWorkout(),
        subscriptionApi.getMySubscription(),
        appointmentApi.getAppointments({ status: "confirmed" })
      ]);
      setDashboard(progRes);
      setTodayWorkout(workoutRes);
      setActiveSub(subRes.subscription);
      if (aptRes.appointments && aptRes.appointments.length > 0) {
        setUpcomingApt(aptRes.appointments[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchDashboard();
  }, []);
  if (isLoading) {
    return <LoadingSpinner message="Aggregating your fitness journey statistics..." />;
  }
  const {
    currentWeight = 75,
    targetWeight = 70,
    weightChange = -3,
    bmi = 23.4,
    attendancePercentage = 80,
    totalAttendanceDays = 12,
    activeGoals = [],
    weightHistory = []
  } = dashboard || {};
  return <div className="space-y-6">
      {
    /* Welcome & Quick Actions Bar */
  }
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#15131D] dark:text-white tracking-tight">Your Fitness Dashboard</h1>
          <p className="text-xs text-[#686476] dark:text-slate-400 mt-1">Welcome back! Track your daily routine, goals, and training consistency</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
    onClick={() => navigate("/member/attendance")}
    className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl shadow-md shadow-purple-600/25 transition-all cursor-pointer"
  >
            <QrCode className="w-4 h-4" />
            <span>Check In</span>
          </button>
          <button
    onClick={() => navigate("/member/workouts")}
    className="flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold text-[#15131D] dark:text-slate-200 bg-white dark:bg-slate-900 border border-[#E8E5EE] dark:border-slate-800 hover:border-purple-500/50 rounded-xl shadow-xs transition-all cursor-pointer"
  >
            <Dumbbell className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>Start Workout</span>
          </button>
          <button
    onClick={() => navigate("/member/progress")}
    className="flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold text-[#15131D] dark:text-slate-200 bg-white dark:bg-slate-900 border border-[#E8E5EE] dark:border-slate-800 hover:border-purple-500/50 rounded-xl shadow-xs transition-all cursor-pointer"
  >
            <Scale className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>Log Weight</span>
          </button>
        </div>
      </div>

      {
    /* Membership Expiry Banner */
  }
      <div className="p-5 bg-white dark:bg-[#0b0d15] border border-[#E8E5EE] dark:border-slate-800 rounded-3xl shadow-[0_10px_30px_rgba(30,20,60,0.04)] dark:shadow-none flex flex-col sm:flex-row sm:items-center justify-between gap-4 theme-transition">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 rounded-2xl shrink-0">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-[#15131D] dark:text-white">
                {activeSub?.planId?.name || "No Active Membership"}
              </span>
              <Badge status={activeSub?.status || "inactive"} />
            </div>
            {activeSub ? <p className="text-xs text-[#686476] dark:text-slate-400 mt-0.5 tabular-nums">
                Valid until <span className="font-bold text-purple-600 dark:text-purple-400">{new Date(activeSub.endDate).toLocaleDateString()}</span>
              </p> : <p className="text-xs text-[#686476] dark:text-slate-400 mt-0.5">Enroll in a membership plan to enjoy gym access.</p>}
          </div>
        </div>

        <button
    onClick={() => navigate("/member/membership")}
    className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 flex items-center gap-1 self-start sm:self-auto cursor-pointer"
  >
          <span>Manage Plan</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {
    /* 4 Stat Cards */
  }
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
    title="Current Weight"
    value={`${currentWeight} kg`}
    subtitle={`Goal: ${targetWeight} kg (${weightChange > 0 ? `+${weightChange}` : weightChange} kg)`}
    icon={Scale}
    onClick={() => navigate("/member/progress")}
  />
        <StatCard
    title="Body Mass Index"
    value={bmi}
    subtitle={bmi < 25 ? "Normal / Healthy BMI" : "Targeting reduction"}
    icon={Activity}
    onClick={() => navigate("/member/progress")}
  />
        <StatCard
    title="Attendance Pace"
    value={`${attendancePercentage}%`}
    subtitle={`${totalAttendanceDays} total check-ins recorded`}
    icon={CheckCircle2}
    trend={{ value: `${totalAttendanceDays} days`, isPositive: true }}
    onClick={() => navigate("/member/attendance")}
  />
        <StatCard
    title="Active Goals"
    value={activeGoals.length}
    subtitle="Target milestones set"
    icon={Award}
    onClick={() => navigate("/member/progress")}
  />
      </div>

      {
    /* Grid: Today's Workout & Weight Progress Chart */
  }
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {
    /* Today's Workout Card */
  }
        <div className="bg-white dark:bg-[#0b0d15] border border-[#E8E5EE] dark:border-slate-800 rounded-3xl p-6 shadow-[0_10px_30px_rgba(30,20,60,0.04)] dark:shadow-none flex flex-col justify-between theme-transition">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#15131D] dark:text-white uppercase tracking-wider">Today&apos;s Workout Routine</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2.5 py-0.5 rounded-full border border-purple-200 dark:border-purple-800/60">
                {todayWorkout?.dayOfWeek || "Today"}
              </span>
            </div>

            {todayWorkout?.todayExercises && todayWorkout.todayExercises.length > 0 ? <div>
                <h3 className="text-sm font-bold text-[#15131D] dark:text-white mb-1">{todayWorkout.plan?.name}</h3>
                <p className="text-xs text-[#686476] dark:text-slate-400 mb-3 line-clamp-1">{todayWorkout.plan?.goal}</p>

                <div className="space-y-2">
                  {todayWorkout.todayExercises.slice(0, 4).map((ex, idx) => <div key={idx} className="p-3 bg-[#F8F7FA] dark:bg-slate-900/80 border border-[#E8E5EE] dark:border-slate-800 rounded-2xl flex items-center justify-between text-xs theme-transition">
                      <span className="font-bold text-[#15131D] dark:text-white">{ex.exerciseId?.name || "Movement"}</span>
                      <span className="font-mono tabular-nums text-purple-600 dark:text-purple-400 font-bold">
                        {ex.sets} × {ex.reps} {ex.targetWeightKg > 0 && `@ ${ex.targetWeightKg}kg`}
                      </span>
                    </div>)}
                </div>
              </div> : <div className="py-8 text-center text-xs text-[#8E8A9C] dark:text-slate-400">
                <Dumbbell className="w-8 h-8 mx-auto mb-2 text-purple-300 dark:text-purple-800" />
                <p className="font-medium">No scheduled workout for today.</p>
                <p className="text-[11px] mt-1 text-[#8E8A9C] dark:text-slate-500">Take an active recovery day or log a custom session.</p>
              </div>}
          </div>

          <div className="mt-5 pt-3.5 border-t border-[#E8E5EE] dark:border-slate-800/80 flex items-center justify-between">
            <button
    onClick={() => navigate("/member/workouts")}
    className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold text-center shadow-md shadow-purple-600/25 transition-all cursor-pointer"
  >
              Open Full Routine
            </button>
          </div>
        </div>

        {
    /* Weight Progression Chart */
  }
        <div className="lg:col-span-2 bg-white dark:bg-[#0b0d15] border border-[#E8E5EE] dark:border-slate-800 rounded-3xl p-6 shadow-[0_10px_30px_rgba(30,20,60,0.04)] dark:shadow-none theme-transition">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-[#15131D] dark:text-white">Weight Progression Curve (kg)</h2>
              <p className="text-xs text-[#686476] dark:text-slate-400">Measured check-in records toward target weight of {targetWeight} kg</p>
            </div>
            <button
    onClick={() => navigate("/member/progress")}
    className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
  >
              Log Measurement
            </button>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weightHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="memberWeightGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={["dataMin - 1", "dataMax + 1"]} tickLine={false} />
                <Tooltip
    contentStyle={{
      backgroundColor: "#0b0d15",
      borderColor: "#1e293b",
      borderRadius: "12px",
      color: "#fff",
      fontSize: "12px",
      boxShadow: "0 10px 25px rgba(0,0,0,0.4)"
    }}
  />
                <Area type="monotone" dataKey="weight" stroke="#7C3AED" strokeWidth={2.5} fill="url(#memberWeightGrad)" name="Weight (kg)" dot={{ r: 3, fill: "#A3E635" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {
    /* Secondary Row: Upcoming Appointment & Active Milestones */
  }
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {
    /* Upcoming Trainer Appointment */
  }
        <div className="bg-white dark:bg-[#0b0d15] border border-[#E8E5EE] dark:border-slate-800 rounded-3xl p-6 shadow-[0_10px_30px_rgba(30,20,60,0.04)] dark:shadow-none theme-transition">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-[#15131D] dark:text-white">Next Scheduled Consultation</h2>
            <button
    onClick={() => navigate("/member/appointments")}
    className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
  >
              Book Session
            </button>
          </div>

          {upcomingApt ? <div className="p-4 bg-[#F8F7FA] dark:bg-slate-900/80 border border-[#E8E5EE] dark:border-slate-800 rounded-2xl flex items-center justify-between theme-transition">
              <div>
                <p className="text-xs font-bold text-[#15131D] dark:text-white">{upcomingApt.topic}</p>
                <p className="text-[11px] text-[#686476] dark:text-slate-400 mt-0.5">
                  Coach: <strong className="text-[#15131D] dark:text-white">{upcomingApt.trainerId?.name}</strong>
                </p>
                <p className="text-[11px] font-mono font-bold text-purple-600 dark:text-purple-400 mt-1">
                  {upcomingApt.date} · {upcomingApt.startTime}–{upcomingApt.endTime}
                </p>
              </div>
              <Badge status={upcomingApt.status} />
            </div> : <p className="text-xs text-[#8E8A9C] dark:text-slate-400 py-4 italic">No appointments scheduled. Book a 1-on-1 session with a trainer.</p>}
        </div>

        {
    /* Active Goals */
  }
        <div className="bg-white dark:bg-[#0b0d15] border border-[#E8E5EE] dark:border-slate-800 rounded-3xl p-6 shadow-[0_10px_30px_rgba(30,20,60,0.04)] dark:shadow-none theme-transition">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-[#15131D] dark:text-white">Current Fitness Milestones</h2>
            <button
    onClick={() => navigate("/member/progress")}
    className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
  >
              View Goals
            </button>
          </div>

          {activeGoals.length > 0 ? <div className="space-y-2.5 text-xs">
              {activeGoals.slice(0, 3).map((g) => <div key={g._id} className="p-3 bg-[#F8F7FA] dark:bg-slate-900/80 border border-[#E8E5EE] dark:border-slate-800 rounded-2xl flex items-center justify-between theme-transition">
                  <div>
                    <span className="font-bold text-[#15131D] dark:text-white">{g.title}</span>
                    <p className="text-[11px] text-[#686476] dark:text-slate-400">Target: {g.targetValue} {g.unit} · Due: {g.targetDate}</p>
                  </div>
                  <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2.5 py-0.5 rounded-full border border-purple-200 dark:border-purple-800/60">
                    Active
                  </span>
                </div>)}
            </div> : <p className="text-xs text-[#8E8A9C] dark:text-slate-400 py-4 italic">No active goals set. Define milestones to keep your training on track.</p>}
        </div>
      </div>
    </div>;
};
export {
  MemberDashboard
};
