import React, { useState, useEffect } from 'react';
import { Dumbbell, Eye } from 'lucide-react';
import { workoutApi } from '../../api/workoutApi';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';

export const AdminWorkouts: React.FC = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'plans' | 'logs'>('plans');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [plansRes, logsRes] = await Promise.all([
        workoutApi.getWorkoutPlans(),
        workoutApi.getWorkoutLogs(),
      ]);
      setPlans(plansRes.plans || []);
      setLogs(logsRes.logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#15131D] dark:text-white tracking-tight">Workout Program Oversight</h1>
        <p className="text-xs text-[#686476] dark:text-slate-400 mt-1">Audit trainer program assignments and member exercise logs</p>
      </div>

      {/* Segmented Controls / Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-white dark:bg-[#0b0d15] border border-[#E8E5EE] dark:border-slate-800 rounded-2xl w-fit shadow-2xs theme-transition">
        <button
          onClick={() => setActiveTab('plans')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'plans'
              ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
              : 'text-[#686476] dark:text-slate-400 hover:text-[#15131D] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900/60'
          }`}
        >
          Workout Plans ({plans.length})
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'logs'
              ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
              : 'text-[#686476] dark:text-slate-400 hover:text-[#15131D] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900/60'
          }`}
        >
          Member Performance Logs ({logs.length})
        </button>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Auditing workout data..." />
      ) : activeTab === 'plans' ? (
        /* Plans Table */
        <div className="bg-white dark:bg-[#0b0d15] border border-[#E8E5EE] dark:border-slate-800 rounded-3xl overflow-hidden shadow-[0_10px_30px_rgba(30,20,60,0.04)] dark:shadow-none theme-transition">
          {plans.length === 0 ? (
            <EmptyState title="No workout plans created yet" description="Trainers haven't registered plans." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8F7FA] dark:bg-slate-950/80 border-b border-[#E8E5EE] dark:border-slate-800 text-[#686476] dark:text-slate-400 font-bold uppercase text-[11px] tracking-wider theme-transition">
                  <tr>
                    <th className="px-6 py-4">Plan Name</th>
                    <th className="px-6 py-4">Member</th>
                    <th className="px-6 py-4">Trainer</th>
                    <th className="px-6 py-4">Difficulty</th>
                    <th className="px-6 py-4">Exercises</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">View</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E5EE] dark:divide-slate-800/80">
                  {plans.map((p) => (
                    <tr key={p._id} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/60 transition-colors">
                      <td className="px-6 py-4 font-bold text-[#15131D] dark:text-white">{p.name}</td>
                      <td className="px-6 py-4 text-[#686476] dark:text-slate-300 font-medium">{p.memberId?.name}</td>
                      <td className="px-6 py-4 text-[#8E8A9C] dark:text-slate-400">{p.trainerId?.name}</td>
                      <td className="px-6 py-4">
                        <span className="capitalize px-2.5 py-1 text-[11px] font-bold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {p.difficulty}
                        </span>
                      </td>
                      <td className="px-6 py-4 tabular-nums font-mono text-[#686476] dark:text-slate-400">
                        {p.exercises?.length || 0} movements
                      </td>
                      <td className="px-6 py-4">
                        <Badge status={p.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedPlan(p)}
                          className="p-1.5 rounded-xl text-[#686476] dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/60 transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* Logs Table */
        <div className="bg-white dark:bg-[#0b0d15] border border-[#E8E5EE] dark:border-slate-800 rounded-3xl overflow-hidden shadow-[0_10px_30px_rgba(30,20,60,0.04)] dark:shadow-none theme-transition">
          {logs.length === 0 ? (
            <EmptyState title="No workout logs registered" description="Members haven't logged workouts." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8F7FA] dark:bg-slate-950/80 border-b border-[#E8E5EE] dark:border-slate-800 text-[#686476] dark:text-slate-400 font-bold uppercase text-[11px] tracking-wider theme-transition">
                  <tr>
                    <th className="px-6 py-4">Member</th>
                    <th className="px-6 py-4">Exercise</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Sets × Reps</th>
                    <th className="px-6 py-4">Weight</th>
                    <th className="px-6 py-4">RPE</th>
                    <th className="px-6 py-4">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E5EE] dark:divide-slate-800/80">
                  {logs.map((log) => (
                    <tr key={log._id} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/60 transition-colors">
                      <td className="px-6 py-4 font-bold text-[#15131D] dark:text-white">{log.memberId?.name}</td>
                      <td className="px-6 py-4 font-bold text-purple-700 dark:text-purple-400">
                        {log.exerciseId?.name || 'Exercise'}
                      </td>
                      <td className="px-6 py-4 tabular-nums font-mono text-[#686476] dark:text-slate-400">{log.date}</td>
                      <td className="px-6 py-4 font-mono tabular-nums text-[#15131D] dark:text-white font-bold">
                        {log.setsCompleted} × {log.repsCompleted}
                      </td>
                      <td className="px-6 py-4 font-mono tabular-nums font-bold text-purple-600 dark:text-purple-400">
                        {log.weightUsedKg} kg
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">
                          {log.difficultyRating}/5
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[#8E8A9C] dark:text-slate-400 italic max-w-xs truncate">
                        {log.notes || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Plan Details Modal */}
      <Modal
        isOpen={!!selectedPlan}
        onClose={() => setSelectedPlan(null)}
        title={selectedPlan?.name || 'Workout Plan'}
        subtitle={`Goal: ${selectedPlan?.goal} · Assigned to ${selectedPlan?.memberId?.name}`}
        maxWidth="lg"
      >
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-3 gap-3 p-3.5 bg-[#F8F7FA] dark:bg-slate-900/80 border border-[#E8E5EE] dark:border-slate-800 rounded-2xl theme-transition">
            <div>
              <p className="text-[#8E8A9C] dark:text-slate-400 text-[11px] font-medium">Difficulty</p>
              <p className="font-bold text-[#15131D] dark:text-white capitalize">{selectedPlan?.difficulty}</p>
            </div>
            <div>
              <p className="text-[#8E8A9C] dark:text-slate-400 text-[11px] font-medium">Duration</p>
              <p className="font-bold text-[#15131D] dark:text-white font-mono">{selectedPlan?.durationWeeks} Weeks</p>
            </div>
            <div>
              <p className="text-[#8E8A9C] dark:text-slate-400 text-[11px] font-medium">Coach</p>
              <p className="font-bold text-[#15131D] dark:text-white">{selectedPlan?.trainerId?.name}</p>
            </div>
          </div>

          <h4 className="font-bold text-[#15131D] dark:text-white pt-2">Prescribed Routine Movements:</h4>
          <div className="divide-y divide-[#E8E5EE] dark:divide-slate-800 border border-[#E8E5EE] dark:border-slate-800 rounded-2xl overflow-hidden theme-transition">
            {selectedPlan?.exercises?.map((ex: any, idx: number) => (
              <div key={idx} className="p-3.5 flex items-center justify-between bg-white dark:bg-[#0b0d15]">
                <div>
                  <span className="font-bold text-[#15131D] dark:text-white">{ex.exerciseId?.name || 'Exercise'}</span>
                  <p className="text-[11px] text-[#686476] dark:text-slate-400 mt-0.5">
                    Day: <span className="font-bold text-purple-600 dark:text-purple-400">{ex.dayOfWeek}</span> · Rest: {ex.restSeconds}s
                  </p>
                  {ex.notes && <p className="text-[10px] text-[#8E8A9C] dark:text-slate-500 italic">{ex.notes}</p>}
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-[#15131D] dark:text-white text-sm">
                    {ex.sets} × {ex.reps}
                  </span>
                  {ex.targetWeightKg > 0 && (
                    <p className="text-[11px] text-purple-600 dark:text-purple-400 font-bold font-mono">{ex.targetWeightKg} kg</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
};
