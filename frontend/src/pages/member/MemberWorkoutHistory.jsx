import { useState, useEffect } from "react";
import { workoutApi } from "../../api/workoutApi";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { EmptyState } from "../../components/common/EmptyState";
const MemberWorkoutHistory = () => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setIsLoading(true);
        const res = await workoutApi.getWorkoutLogs();
        setLogs(res.logs || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLogs();
  }, []);
  return <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#15131D] dark:text-white tracking-tight">
          Workout Performance Logbook
        </h1>
        <p className="text-xs sm:text-sm text-[#686476] dark:text-slate-400 mt-1">
          Chronological record of all working sets and loads completed
        </p>
      </div>

      <div className="bg-white dark:bg-[#0b0d14] border border-slate-200/80 dark:border-white/10 rounded-3xl overflow-hidden shadow-xs theme-transition">
        {isLoading ? <LoadingSpinner message="Retrieving workout logbook..." /> : logs.length === 0 ? <EmptyState
    title="No workout records logged yet"
    description="When you complete exercises from your routine, record your actual reps to track strength increases."
  /> : <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-[#686476] dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-6 py-4">Exercise</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Sets & Reps</th>
                  <th className="px-6 py-4">Load (kg)</th>
                  <th className="px-6 py-4">Exertion (RPE)</th>
                  <th className="px-6 py-4">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {logs.map((log) => <tr key={log._id} className="hover:bg-purple-50/20 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-bold text-[#15131D] dark:text-white">
                      {log.exerciseId?.name || "Exercise"}
                      <span className="text-[10px] text-[#686476] dark:text-slate-400 block font-medium">
                        {log.exerciseId?.muscleGroup}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#686476] dark:text-slate-400 tabular-nums font-medium">{log.date}</td>
                    <td className="px-6 py-4 font-mono tabular-nums font-bold text-[#15131D] dark:text-white">
                      {log.setsCompleted} sets × {log.repsCompleted} reps
                    </td>
                    <td className="px-6 py-4 font-mono tabular-nums font-black text-purple-600 dark:text-purple-400">
                      {log.weightUsedKg > 0 ? `${log.weightUsedKg} kg` : "Bodyweight"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold text-[#15131D] dark:text-white bg-slate-100 dark:bg-white/10 px-2.5 py-1 rounded-full border border-slate-200/60 dark:border-white/10">
                        RPE {log.difficultyRating}/5
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#686476] dark:text-slate-400 italic max-w-xs truncate">
                      {log.notes || "\u2014"}
                    </td>
                  </tr>)}
              </tbody>
            </table>
          </div>}
      </div>
    </div>;
};
export {
  MemberWorkoutHistory
};
