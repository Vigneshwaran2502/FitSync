import React, { useState, useEffect } from 'react';
import { Dumbbell, Plus, CheckCircle2, Calendar, Clock, ChevronRight } from 'lucide-react';
import { workoutApi } from '../../api/workoutApi';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const MemberWorkouts: React.FC = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [todayRoutine, setTodayRoutine] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Log Workout Modal
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [logExercise, setLogExercise] = useState<any>(null);
  const [logWorkoutPlanId, setLogWorkoutPlanId] = useState<string>('');
  const [setsCompleted, setSetsCompleted] = useState(3);
  const [repsCompleted, setRepsCompleted] = useState(10);
  const [weightUsedKg, setWeightUsedKg] = useState(50);
  const [difficultyRating, setDifficultyRating] = useState(3);
  const [notes, setNotes] = useState('');
  const [isSubmittingLog, setIsSubmittingLog] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchWorkouts = async () => {
    try {
      setIsLoading(true);
      const [plansRes, todayRes] = await Promise.all([
        workoutApi.getWorkoutPlans(),
        workoutApi.getTodayWorkout(),
      ]);
      setPlans(plansRes.plans || []);
      setTodayRoutine(todayRes);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const handleOpenLogModal = (exercise: any, planId?: string) => {
    setLogExercise(exercise);
    setLogWorkoutPlanId(planId || '');
    setSetsCompleted(exercise.sets || 3);
    setRepsCompleted(exercise.reps || 10);
    setWeightUsedKg(exercise.targetWeightKg || 0);
    setDifficultyRating(3);
    setNotes('');
    setIsLogModalOpen(true);
  };

  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logExercise) return;

    try {
      setIsSubmittingLog(true);
      await workoutApi.logWorkout({
        exerciseId: logExercise.exerciseId?._id || logExercise.exerciseId || logExercise._id,
        workoutPlanId: logWorkoutPlanId || undefined,
        setsCompleted: Number(setsCompleted),
        repsCompleted: Number(repsCompleted),
        weightUsedKg: Number(weightUsedKg),
        difficultyRating: Number(difficultyRating),
        notes,
      });

      setIsLogModalOpen(false);
      setFeedback(`Logged ${setsCompleted} sets of ${logExercise.exerciseId?.name || 'exercise'}! Keep crushing it!`);
      setTimeout(() => setFeedback(null), 4000);
      fetchWorkouts();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error recording workout log');
    } finally {
      setIsSubmittingLog(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Retrieving your prescribed training routine..." />;
  }

  const activePlan = plans.find((p) => p.status === 'active') || plans[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#15131D] dark:text-white tracking-tight">Assigned Workout Routines</h1>
        <p className="text-xs text-[#686476] dark:text-slate-400 mt-1">Follow coach-assigned target sets and log actual session performance</p>
      </div>

      {feedback && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 rounded-2xl text-xs font-semibold flex items-center gap-2 theme-transition">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Today's Workout Feature Block */}
      {todayRoutine?.todayExercises && todayRoutine.todayExercises.length > 0 && (
        <div className="bg-white dark:bg-[#0b0d15] border-2 border-purple-500/80 rounded-3xl p-6 shadow-[0_10px_30px_rgba(124,58,237,0.06)] dark:shadow-none theme-transition">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-lime-500 animate-pulse" />
              <h2 className="text-base font-bold text-[#15131D] dark:text-white">
                Today&apos;s Workout — {todayRoutine.dayOfWeek}
              </h2>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2.5 py-0.5 rounded-full border border-purple-200 dark:border-purple-800/60">
              Active Routine
            </span>
          </div>

          <p className="text-xs text-[#686476] dark:text-slate-400 mb-5">
            Assigned under <strong className="text-[#15131D] dark:text-white">{todayRoutine.plan?.name}</strong>. Log your completed working sets as you train:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {todayRoutine.todayExercises.map((ex: any, idx: number) => (
              <div
                key={idx}
                className="p-4 bg-[#F8F7FA] dark:bg-slate-900/80 border border-[#E8E5EE] dark:border-slate-800 rounded-2xl flex items-center justify-between theme-transition"
              >
                <div>
                  <p className="text-xs font-bold text-[#15131D] dark:text-white">{ex.exerciseId?.name || 'Movement'}</p>
                  <p className="text-[11px] text-[#686476] dark:text-slate-400 mt-1">
                    Target: <strong className="text-purple-600 dark:text-purple-400 font-mono">{ex.sets} × {ex.reps}</strong>
                    {ex.targetWeightKg > 0 && ` @ ${ex.targetWeightKg} kg`} · Rest: {ex.restSeconds}s
                  </p>
                  {ex.notes && <p className="text-[10px] text-[#8E8A9C] dark:text-slate-500 italic mt-1">{ex.notes}</p>}
                </div>

                <button
                  onClick={() => handleOpenLogModal(ex, todayRoutine.plan?._id)}
                  className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer shrink-0"
                >
                  Log Reps
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full Assigned Plans by Day */}
      {!activePlan ? (
        <div className="p-10 text-center bg-white dark:bg-[#0b0d15] border border-dashed border-[#E8E5EE] dark:border-slate-800 rounded-3xl theme-transition">
          <Dumbbell className="w-10 h-10 text-purple-300 dark:text-purple-800 mx-auto mb-2" />
          <h3 className="text-base font-bold text-[#15131D] dark:text-white">No workout plans assigned yet</h3>
          <p className="text-xs text-[#686476] dark:text-slate-400 max-w-sm mx-auto mt-1">
            Your trainer will configure a specialized progressive routine based on your fitness goals.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0b0d15] border border-[#E8E5EE] dark:border-slate-800 rounded-3xl p-6 shadow-[0_10px_30px_rgba(30,20,60,0.04)] dark:shadow-none theme-transition">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8E5EE] dark:border-slate-800/80 pb-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="text-lg font-bold text-[#15131D] dark:text-white tracking-tight">{activePlan.name}</h3>
                  <Badge status={activePlan.status} />
                </div>
                <p className="text-xs text-[#686476] dark:text-slate-400 mt-1">
                  Coach: <strong className="text-[#15131D] dark:text-white">{activePlan.trainerId?.name}</strong> · Goal: {activePlan.goal} · Difficulty: <span className="capitalize">{activePlan.difficulty}</span>
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/60 px-3 py-1 rounded-xl">
                {activePlan.durationWeeks} Weeks Program
              </span>
            </div>

            {/* Group exercises by Day */}
            <div className="mt-5 space-y-4">
              {DAYS.map((day) => {
                const dayExs = activePlan.exercises?.filter((e: any) => e.dayOfWeek === day) || [];
                if (dayExs.length === 0) return null;

                return (
                  <div key={day} className="border border-[#E8E5EE] dark:border-slate-800 rounded-2xl overflow-hidden theme-transition">
                    <div className="px-4 py-2.5 bg-[#F8F7FA] dark:bg-slate-900 border-b border-[#E8E5EE] dark:border-slate-800 flex items-center justify-between">
                      <span className="text-xs font-bold text-[#15131D] dark:text-white uppercase tracking-wider">{day}</span>
                      <span className="text-[11px] text-[#8E8A9C] dark:text-slate-400">{dayExs.length} Exercises</span>
                    </div>

                    <div className="divide-y divide-[#E8E5EE] dark:divide-slate-800/80 p-2 space-y-1">
                      {dayExs.map((ex: any, idx: number) => (
                        <div key={idx} className="p-3 flex items-center justify-between text-xs hover:bg-[#F8F7FA] dark:hover:bg-slate-900/60 rounded-xl transition-colors">
                          <div>
                            <span className="font-bold text-[#15131D] dark:text-white">{ex.exerciseId?.name || 'Movement'}</span>
                            <span className="text-slate-300 dark:text-slate-700 mx-2">·</span>
                            <span className="font-mono text-[#686476] dark:text-slate-300">
                              {ex.sets} sets × {ex.reps} reps {ex.targetWeightKg > 0 && `@ ${ex.targetWeightKg}kg`}
                            </span>
                            {ex.notes && <p className="text-[10px] text-[#8E8A9C] dark:text-slate-500 italic mt-0.5">{ex.notes}</p>}
                          </div>

                          <button
                            onClick={() => handleOpenLogModal(ex, activePlan._id)}
                            className="px-3 py-1 text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/60 rounded-xl border border-purple-200 dark:border-purple-800/60 transition-colors cursor-pointer"
                          >
                            Log Actual
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Log Actual Performance Modal */}
      <Modal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        title={`Log Performance: ${logExercise?.exerciseId?.name || logExercise?.name || 'Exercise'}`}
        subtitle="Record actual working sets completed during your session"
      >
        <form onSubmit={handleLogSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-[#15131D] dark:text-white mb-1.5">Sets Completed</label>
              <input
                type="number"
                required
                min={1}
                value={setsCompleted}
                onChange={(e) => setSetsCompleted(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 border border-[#E8E5EE] dark:border-slate-800 rounded-xl tabular-nums font-mono bg-[#F8F7FA] dark:bg-slate-900 text-[#15131D] dark:text-white focus:outline-hidden focus:border-purple-600"
              />
            </div>
            <div>
              <label className="block font-bold text-[#15131D] dark:text-white mb-1.5">Reps Completed</label>
              <input
                type="number"
                required
                min={1}
                value={repsCompleted}
                onChange={(e) => setRepsCompleted(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 border border-[#E8E5EE] dark:border-slate-800 rounded-xl tabular-nums font-mono bg-[#F8F7FA] dark:bg-slate-900 text-[#15131D] dark:text-white focus:outline-hidden focus:border-purple-600"
              />
            </div>
            <div>
              <label className="block font-bold text-[#15131D] dark:text-white mb-1.5">Weight Used (kg)</label>
              <input
                type="number"
                min={0}
                value={weightUsedKg}
                onChange={(e) => setWeightUsedKg(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 border border-[#E8E5EE] dark:border-slate-800 rounded-xl tabular-nums font-mono bg-[#F8F7FA] dark:bg-slate-900 text-[#15131D] dark:text-white focus:outline-hidden focus:border-purple-600"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-[#15131D] dark:text-white mb-1.5">Perceived Exertion (RPE 1–5)</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setDifficultyRating(val)}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-colors cursor-pointer ${
                    difficultyRating === val
                      ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                      : 'border-[#E8E5EE] dark:border-slate-800 text-[#686476] dark:text-slate-300 hover:bg-[#F8F7FA] dark:hover:bg-slate-900'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-[#8E8A9C] dark:text-slate-400 mt-1.5">1 = Very Easy / Warmup · 3 = Moderate · 5 = Maximum Effort</p>
          </div>

          <div>
            <label className="block font-bold text-[#15131D] dark:text-white mb-1.5">Session Notes & Cues</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Felt strong on all sets. Form felt locked in."
              className="w-full px-3.5 py-2.5 border border-[#E8E5EE] dark:border-slate-800 rounded-xl bg-[#F8F7FA] dark:bg-slate-900 text-[#15131D] dark:text-white focus:outline-hidden focus:border-purple-600"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3">
            <button
              type="button"
              onClick={() => setIsLogModalOpen(false)}
              className="px-4 py-2 font-bold text-xs text-[#686476] dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingLog}
              className="px-5 py-2.5 font-bold text-xs text-white bg-purple-600 hover:bg-purple-500 disabled:opacity-60 rounded-xl shadow-md shadow-purple-600/25 transition-all cursor-pointer"
            >
              {isSubmittingLog ? 'Recording...' : 'Record Workout Log'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
