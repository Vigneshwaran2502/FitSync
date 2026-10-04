import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, Dumbbell, TrendingUp } from 'lucide-react';
import { trainerApi } from '../../api/trainerApi';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';

export const TrainerMembers: React.FC = () => {
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchMembers = async () => {
    try {
      setIsLoading(true);
      const res = await trainerApi.getAssignedMembers();
      setMembers(res.members || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#15131D] dark:text-white tracking-tight">Assigned Client Athletes</h1>
          <p className="text-xs text-[#686476] dark:text-slate-400 mt-1">Manage your coaching clients, fitness goals, and workout assignments</p>
        </div>

        <button
          onClick={() => navigate('/trainer/workout-plans')}
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl shadow-md shadow-purple-600/25 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Workout Plan</span>
        </button>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Retrieving client roster..." />
      ) : members.length === 0 ? (
        <EmptyState
          title="No clients currently assigned"
          description="Members with assigned workout plans or consultations will appear in your roster."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {members.map((m) => {
            const fp = m.fitnessProfile;
            return (
              <div
                key={m._id}
                className="bg-white dark:bg-[#0b0d15] border border-[#E8E5EE] dark:border-slate-800 rounded-3xl p-6 shadow-[0_10px_30px_rgba(30,20,60,0.04)] dark:shadow-none flex flex-col justify-between hover:border-purple-400 dark:hover:border-purple-500/50 hover:-translate-y-0.5 transition-all theme-transition"
              >
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold text-sm shrink-0">
                      {m.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-[#15131D] dark:text-white truncate">{m.name}</h3>
                      <p className="text-[11px] text-[#8E8A9C] dark:text-slate-400 truncate">{m.email}</p>
                    </div>
                  </div>

                  {/* Profile Metrics */}
                  {fp ? (
                    <div className="grid grid-cols-3 gap-2 p-3 bg-[#F8F7FA] dark:bg-slate-900/80 border border-[#E8E5EE] dark:border-slate-800 rounded-2xl text-xs theme-transition">
                      <div>
                        <span className="text-[10px] text-[#8E8A9C] dark:text-slate-400 uppercase font-medium">Current</span>
                        <p className="font-bold text-[#15131D] dark:text-white tabular-nums font-mono mt-0.5">{fp.currentWeightKg} kg</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#8E8A9C] dark:text-slate-400 uppercase font-medium">Target</span>
                        <p className="font-bold text-purple-600 dark:text-purple-400 tabular-nums font-mono mt-0.5">{fp.targetWeightKg} kg</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#8E8A9C] dark:text-slate-400 uppercase font-medium">Goal</span>
                        <p className="font-bold text-[#15131D] dark:text-white truncate mt-0.5">{fp.fitnessGoal}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-[#8E8A9C] dark:text-slate-500 italic mt-3">Profile onboarding pending</p>
                  )}
                </div>

                {/* Quick actions */}
                <div className="mt-5 pt-3.5 border-t border-[#E8E5EE] dark:border-slate-800/80 flex items-center justify-between text-xs">
                  <button
                    onClick={() => navigate(`/trainer/progress?memberId=${m._id}`)}
                    className="flex items-center gap-1.5 font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>View Progress</span>
                  </button>
                  <button
                    onClick={() => navigate('/trainer/workout-plans')}
                    className="flex items-center gap-1.5 font-bold text-[#686476] dark:text-slate-300 hover:text-[#15131D] dark:hover:text-white cursor-pointer"
                  >
                    <Dumbbell className="w-3.5 h-3.5" />
                    <span>Workout Plan</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
