import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";
import { trainerApi } from "../../api/trainerApi";
import { progressApi } from "../../api/progressApi";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
const TrainerMemberProgress = () => {
  const [searchParams] = useSearchParams();
  const [members, setMembers] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState(searchParams.get("memberId") || "");
  const [dashboard, setDashboard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const res = await trainerApi.getAssignedMembers();
        const mems = res.members || [];
        setMembers(mems);
        if (!selectedMemberId && mems.length > 0) {
          setSelectedMemberId(mems[0]._id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchInitial();
  }, []);
  useEffect(() => {
    if (!selectedMemberId) return;
    const fetchMemberDashboard = async () => {
      try {
        setIsLoading(true);
        const res = await progressApi.getProgressDashboard(selectedMemberId);
        setDashboard(res);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMemberDashboard();
  }, [selectedMemberId]);
  return <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#15131D] dark:text-white tracking-tight">
            Athlete Performance Telemetry
          </h1>
          <p className="text-xs sm:text-sm text-[#686476] dark:text-slate-400 mt-1">
            Inspect client weight changes, BMI curves, and fitness goal progress
          </p>
        </div>

        {members.length > 0 && <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#686476] dark:text-slate-400">Select Athlete:</span>
            <select
    value={selectedMemberId}
    onChange={(e) => setSelectedMemberId(e.target.value)}
    className="px-3.5 py-2 text-xs font-bold border border-slate-200 dark:border-white/10 rounded-xl bg-white dark:bg-[#0b0d14] text-[#15131D] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 dark:focus:border-purple-400 transition-colors shadow-xs"
  >
              {members.map((m) => <option key={m._id} value={m._id} className="dark:bg-[#0b0d14]">
                  {m.name}
                </option>)}
            </select>
          </div>}
      </div>

      {isLoading ? <LoadingSpinner message="Loading client biomechanical charts..." /> : !dashboard ? <p className="text-xs text-[#686476] dark:text-slate-400">No member data available.</p> : <div className="space-y-6">
          {
    /* Key Metric Cards */
  }
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[#0b0d14] border border-slate-200/80 dark:border-white/10 rounded-3xl p-5 shadow-xs theme-transition">
              <span className="text-[11px] font-bold text-[#686476] dark:text-slate-400 uppercase tracking-wider">
                Current Weight
              </span>
              <p className="text-2xl font-black text-[#15131D] dark:text-white mt-1 tabular-nums">
                {dashboard.currentWeight} kg
              </p>
              <p className="text-[11px] text-[#686476] dark:text-slate-400 mt-0.5">
                Target: {dashboard.targetWeight} kg
              </p>
            </div>
            <div className="bg-white dark:bg-[#0b0d14] border border-slate-200/80 dark:border-white/10 rounded-3xl p-5 shadow-xs theme-transition">
              <span className="text-[11px] font-bold text-[#686476] dark:text-slate-400 uppercase tracking-wider">
                Weight Shift
              </span>
              <p className="text-2xl font-black text-[#15131D] dark:text-white mt-1 tabular-nums">
                {dashboard.weightChange > 0 ? `+${dashboard.weightChange}` : dashboard.weightChange} kg
              </p>
              <p className="text-[11px] text-purple-600 dark:text-purple-400 font-bold mt-0.5">
                From {dashboard.startingWeight} kg start
              </p>
            </div>
            <div className="bg-white dark:bg-[#0b0d14] border border-slate-200/80 dark:border-white/10 rounded-3xl p-5 shadow-xs theme-transition">
              <span className="text-[11px] font-bold text-[#686476] dark:text-slate-400 uppercase tracking-wider">
                Body Mass Index
              </span>
              <p className="text-2xl font-black text-[#15131D] dark:text-white mt-1 tabular-nums">
                {dashboard.bmi}
              </p>
              <p className="text-[11px] text-[#686476] dark:text-slate-400 mt-0.5">
                {dashboard.bmi < 25 ? "Normal BMI" : "Overweight range"}
              </p>
            </div>
            <div className="bg-white dark:bg-[#0b0d14] border border-slate-200/80 dark:border-white/10 rounded-3xl p-5 shadow-xs theme-transition">
              <span className="text-[11px] font-bold text-[#686476] dark:text-slate-400 uppercase tracking-wider">
                Workout Volume
              </span>
              <p className="text-2xl font-black text-[#15131D] dark:text-white mt-1 tabular-nums">
                {dashboard.totalWorkoutLogs}
              </p>
              <p className="text-[11px] text-[#686476] dark:text-slate-400 mt-0.5">
                Total completed sessions
              </p>
            </div>
          </div>

          {
    /* Weight Progression Chart */
  }
          <div className="bg-white dark:bg-[#0b0d14] border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 shadow-xs theme-transition">
            <h2 className="text-base font-bold text-[#15131D] dark:text-white mb-1">
              Body Weight Tracking Timeline (kg)
            </h2>
            <p className="text-xs text-[#686476] dark:text-slate-400 mb-6">
              Measured weekly progress vs target line
            </p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dashboard.weightHistory} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} domain={["dataMin - 2", "dataMax + 2"]} tickLine={false} />
                  <Tooltip
    contentStyle={{
      backgroundColor: "#0f172a",
      borderRadius: "16px",
      border: "1px solid rgba(255,255,255,0.1)",
      color: "#fff",
      fontSize: "12px"
    }}
  />
                  <Line type="monotone" dataKey="weight" stroke="#7C3AED" strokeWidth={3} name="Weight (kg)" dot={{ r: 4, fill: "#7C3AED" }} />
                  <Line type="monotone" dataKey="target" stroke="#94a3b8" strokeDasharray="4 4" strokeWidth={2} name="Target (kg)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {
    /* Fitness Goals */
  }
          <div className="bg-white dark:bg-[#0b0d14] border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 shadow-xs theme-transition">
            <h2 className="text-base font-bold text-[#15131D] dark:text-white mb-4">
              Targeted Fitness Milestones
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {dashboard.activeGoals?.map((g) => <div key={g._id} className="p-4 bg-slate-50/70 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl theme-transition">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#15131D] dark:text-white">{g.title}</span>
                    <span className="text-[10px] font-bold tracking-wider text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 px-2.5 py-1 rounded-full border border-purple-200/60 dark:border-purple-800/60 uppercase">
                      {g.category}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between tabular-nums text-[#686476] dark:text-slate-400 font-medium">
                    <span>Target: {g.targetValue} {g.unit}</span>
                    <span>Due: {g.targetDate}</span>
                  </div>
                </div>)}
            </div>
          </div>
        </div>}
    </div>;
};
export {
  TrainerMemberProgress
};
