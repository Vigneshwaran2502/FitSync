import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Scale,
  Award,
  Plus,
  CheckCircle2,
  Trash2,
  Activity,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { progressApi } from '../../api/progressApi';
import { StatCard } from '../../components/common/StatCard';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const MemberProgress: React.FC = () => {
  const [dashboard, setDashboard] = useState<any>(null);
  const [goals, setGoals] = useState<any[]>([]);
  const [measurements, setMeasurements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New Measurement Modal
  const [isMeasureModalOpen, setIsMeasureModalOpen] = useState(false);
  const [measureWeight, setMeasureWeight] = useState(75);
  const [measureWaist, setMeasureWaist] = useState('');
  const [measureChest, setMeasureChest] = useState('');
  const [measureArms, setMeasureArms] = useState('');
  const [measureBodyFat, setMeasureBodyFat] = useState('');
  const [measureNotes, setMeasureNotes] = useState('');

  // New Goal Modal
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalCategory, setGoalCategory] = useState('Weight');
  const [goalTarget, setGoalTarget] = useState(70);
  const [goalCurrent, setGoalCurrent] = useState(75);
  const [goalUnit, setGoalUnit] = useState('kg');
  const [goalDate, setGoalDate] = useState('2026-12-31');

  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchProgress = async () => {
    try {
      setIsLoading(true);
      const [dashRes, goalsRes, measRes] = await Promise.all([
        progressApi.getProgressDashboard(),
        progressApi.getGoals(),
        progressApi.getMeasurements(),
      ]);
      setDashboard(dashRes);
      setGoals(goalsRes.goals || []);
      setMeasurements(measRes.measurements || []);
      if (dashRes.currentWeight) setMeasureWeight(dashRes.currentWeight);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  const handleLogMeasurement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await progressApi.addMeasurement({
        weightKg: Number(measureWeight),
        waistCm: measureWaist ? Number(measureWaist) : undefined,
        chestCm: measureChest ? Number(measureChest) : undefined,
        armsCm: measureArms ? Number(measureArms) : undefined,
        bodyFatPercent: measureBodyFat ? Number(measureBodyFat) : undefined,
        notes: measureNotes,
      });

      setIsMeasureModalOpen(false);
      setFeedback('Measurement logged! Your progress chart has been updated.');
      setTimeout(() => setFeedback(null), 4000);
      fetchProgress();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error saving measurement');
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await progressApi.createGoal({
        title: goalTitle,
        category: goalCategory,
        targetValue: Number(goalTarget),
        currentValue: Number(goalCurrent),
        unit: goalUnit,
        targetDate: goalDate,
      });

      setIsGoalModalOpen(false);
      setGoalTitle('');
      setFeedback('New fitness milestone registered!');
      setTimeout(() => setFeedback(null), 4000);
      fetchProgress();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error creating goal');
    }
  };

  const handleToggleAchieved = async (goal: any) => {
    const newStatus = goal.status === 'active' ? 'achieved' : 'active';
    try {
      await progressApi.updateGoal(goal._id, { status: newStatus });
      setFeedback(newStatus === 'achieved' ? '🎉 Milestone accomplished! Outstanding work!' : 'Goal reactivated.');
      setTimeout(() => setFeedback(null), 5000);
      fetchProgress();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error updating goal');
    }
  };

  const handleDeleteGoal = async (id: string) => {
    try {
      await progressApi.deleteGoal(id);
      fetchProgress();
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Calculating your progress benchmarks..." />;
  }

  const {
    currentWeight = 75,
    targetWeight = 70,
    startingWeight = 78,
    weightChange = -3,
    bmi = 23.4,
    attendancePercentage = 80,
    totalAttendanceDays = 12,
    weightHistory = [],
  } = dashboard || {};

  const activeGoalsList = goals.filter((g) => g.status === 'active');
  const achievedGoalsList = goals.filter((g) => g.status === 'achieved');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#15131D] dark:text-white tracking-tight">Fitness Progress & Measurements</h1>
          <p className="text-xs text-[#686476] dark:text-slate-400 mt-1">Track your weight trajectory, body composition changes, and fitness goals</p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsMeasureModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl shadow-md shadow-purple-600/25 transition-all cursor-pointer"
          >
            <Scale className="w-4 h-4" />
            <span>Log Measurements</span>
          </button>
          <button
            onClick={() => setIsGoalModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold text-[#15131D] dark:text-slate-200 bg-white dark:bg-slate-900 border border-[#E8E5EE] dark:border-slate-800 hover:border-purple-500/50 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>New Milestone</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 rounded-2xl text-xs font-semibold flex items-center gap-2 theme-transition">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Current Weight"
          value={`${currentWeight} kg`}
          subtitle={`Target: ${targetWeight} kg`}
          icon={Scale}
        />
        <StatCard
          title="Weight Shift"
          value={`${weightChange > 0 ? `+${weightChange}` : weightChange} kg`}
          subtitle={`Started at ${startingWeight} kg`}
          icon={TrendingUp}
          trend={{ value: `${Math.abs(weightChange)} kg change`, isPositive: weightChange <= 0 }}
        />
        <StatCard
          title="Body Mass Index"
          value={bmi}
          subtitle={bmi < 25 ? 'Normal BMI' : 'Elevated BMI'}
          icon={Activity}
        />
        <StatCard
          title="Attendance Total"
          value={`${totalAttendanceDays} days`}
          subtitle={`${attendancePercentage}% of monthly target`}
          icon={CheckCircle2}
        />
      </div>

      {/* Weight History Progression Chart */}
      <div className="bg-white dark:bg-[#0b0d15] border border-[#E8E5EE] dark:border-slate-800 rounded-3xl p-6 shadow-[0_10px_30px_rgba(30,20,60,0.04)] dark:shadow-none theme-transition">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-[#15131D] dark:text-white">Body Weight Timeline (kg)</h2>
            <p className="text-xs text-[#686476] dark:text-slate-400">Weekly recorded check-ins vs your target benchmark of {targetWeight} kg</p>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2.5 py-0.5 rounded-full border border-purple-200 dark:border-purple-800/60">
            Target: {targetWeight} kg
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weightHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="progressGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} domain={['dataMin - 1', 'dataMax + 1']} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0b0d15',
                  borderColor: '#1e293b',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
                }}
              />
              <Area type="monotone" dataKey="weight" stroke="#7C3AED" strokeWidth={2.5} fill="url(#progressGrad)" name="Weight (kg)" dot={{ r: 4, fill: '#A3E635' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Goals & Body Composition Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active & Achieved Goals */}
        <div className="bg-white dark:bg-[#0b0d15] border border-[#E8E5EE] dark:border-slate-800 rounded-3xl p-6 shadow-[0_10px_30px_rgba(30,20,60,0.04)] dark:shadow-none space-y-4 theme-transition">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#15131D] dark:text-white">Target Milestones ({activeGoalsList.length})</h2>
            <button
              onClick={() => setIsGoalModalOpen(true)}
              className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
            >
              + Add Goal
            </button>
          </div>

          {activeGoalsList.length === 0 ? (
            <p className="text-xs text-[#8E8A9C] dark:text-slate-400 py-4 italic">No active milestones. Click &apos;+ Add Goal&apos; to create one.</p>
          ) : (
            <div className="space-y-2.5">
              {activeGoalsList.map((g) => (
                <div key={g._id} className="p-3.5 bg-[#F8F7FA] dark:bg-slate-900/80 border border-[#E8E5EE] dark:border-slate-800 rounded-2xl text-xs flex items-center justify-between gap-3 theme-transition">
                  <div>
                    <span className="font-bold text-[#15131D] dark:text-white">{g.title}</span>
                    <p className="text-[11px] text-[#686476] dark:text-slate-400 mt-0.5">
                      Target: <strong className="text-[#15131D] dark:text-white">{g.targetValue} {g.unit}</strong> · Current: {g.currentValue} {g.unit} · Due: {g.targetDate}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleToggleAchieved(g)}
                      className="px-2.5 py-1 text-[11px] font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 rounded-xl border border-purple-200 dark:border-purple-800 transition-colors cursor-pointer"
                      title="Mark Achieved"
                    >
                      Achieved!
                    </button>
                    <button
                      onClick={() => handleDeleteGoal(g._id)}
                      className="p-1.5 text-[#8E8A9C] hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Achieved Goals Section */}
          {achievedGoalsList.length > 0 && (
            <div className="pt-4 border-t border-[#E8E5EE] dark:border-slate-800/80">
              <span className="text-[11px] font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider block mb-2.5">
                Accomplished Milestones ({achievedGoalsList.length})
              </span>
              <div className="space-y-2">
                {achievedGoalsList.map((g) => (
                  <div key={g._id} className="p-3 bg-purple-50/50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 rounded-xl text-xs flex items-center justify-between text-[#15131D] dark:text-white theme-transition">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                      <span className="font-medium line-through text-[#686476] dark:text-slate-400">{g.title}</span>
                    </div>
                    <span className="text-[10px] font-bold text-lime-600 dark:text-lime-400">COMPLETED</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Body Measurements Log */}
        <div className="bg-white dark:bg-[#0b0d15] border border-[#E8E5EE] dark:border-slate-800 rounded-3xl p-6 shadow-[0_10px_30px_rgba(30,20,60,0.04)] dark:shadow-none space-y-4 theme-transition">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#15131D] dark:text-white">Measurement History</h2>
            <button
              onClick={() => setIsMeasureModalOpen(true)}
              className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
            >
              + Log
            </button>
          </div>

          {measurements.length === 0 ? (
            <p className="text-xs text-[#8E8A9C] dark:text-slate-400 py-4 italic">No measurements recorded yet.</p>
          ) : (
            <div className="divide-y divide-[#E8E5EE] dark:divide-slate-800/80 max-h-80 overflow-y-auto pr-1">
              {measurements.map((m) => (
                <div key={m._id} className="py-3 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold text-[#15131D] dark:text-white tabular-nums font-mono">{m.weightKg} kg</span>
                    <p className="text-[11px] text-[#8E8A9C] dark:text-slate-400 tabular-nums">{m.date}</p>
                  </div>
                  <div className="text-right text-[11px] text-[#686476] dark:text-slate-400">
                    {m.bodyFatPercent && <span>Fat: {m.bodyFatPercent}% · </span>}
                    {m.waistCm && <span>Waist: {m.waistCm}cm · </span>}
                    {m.chestCm && <span>Chest: {m.chestCm}cm</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Log Measurement Modal */}
      <Modal
        isOpen={isMeasureModalOpen}
        onClose={() => setIsMeasureModalOpen(false)}
        title="Log Body Measurements"
        subtitle="Track body composition changes over time"
      >
        <form onSubmit={handleLogMeasurement} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-[#15131D] dark:text-white mb-1.5">Body Weight (kg) *</label>
            <input
              type="number"
              step="0.1"
              required
              value={measureWeight}
              onChange={(e) => setMeasureWeight(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 border border-[#E8E5EE] dark:border-slate-800 rounded-xl tabular-nums bg-[#F8F7FA] dark:bg-slate-900 text-[#15131D] dark:text-white focus:outline-hidden focus:border-purple-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#15131D] dark:text-white mb-1.5">Waist (cm)</label>
              <input
                type="number"
                step="0.5"
                value={measureWaist}
                onChange={(e) => setMeasureWaist(e.target.value)}
                placeholder="Optional"
                className="w-full px-3.5 py-2.5 border border-[#E8E5EE] dark:border-slate-800 rounded-xl tabular-nums bg-[#F8F7FA] dark:bg-slate-900 text-[#15131D] dark:text-white focus:outline-hidden focus:border-purple-600"
              />
            </div>
            <div>
              <label className="block font-bold text-[#15131D] dark:text-white mb-1.5">Chest (cm)</label>
              <input
                type="number"
                step="0.5"
                value={measureChest}
                onChange={(e) => setMeasureChest(e.target.value)}
                placeholder="Optional"
                className="w-full px-3.5 py-2.5 border border-[#E8E5EE] dark:border-slate-800 rounded-xl tabular-nums bg-[#F8F7FA] dark:bg-slate-900 text-[#15131D] dark:text-white focus:outline-hidden focus:border-purple-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#15131D] dark:text-white mb-1.5">Arms (cm)</label>
              <input
                type="number"
                step="0.5"
                value={measureArms}
                onChange={(e) => setMeasureArms(e.target.value)}
                placeholder="Optional"
                className="w-full px-3.5 py-2.5 border border-[#E8E5EE] dark:border-slate-800 rounded-xl tabular-nums bg-[#F8F7FA] dark:bg-slate-900 text-[#15131D] dark:text-white focus:outline-hidden focus:border-purple-600"
              />
            </div>
            <div>
              <label className="block font-bold text-[#15131D] dark:text-white mb-1.5">Body Fat %</label>
              <input
                type="number"
                step="0.1"
                value={measureBodyFat}
                onChange={(e) => setMeasureBodyFat(e.target.value)}
                placeholder="Optional"
                className="w-full px-3.5 py-2.5 border border-[#E8E5EE] dark:border-slate-800 rounded-xl tabular-nums bg-[#F8F7FA] dark:bg-slate-900 text-[#15131D] dark:text-white focus:outline-hidden focus:border-purple-600"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-[#15131D] dark:text-white mb-1.5">Check-in Notes</label>
            <input
              type="text"
              value={measureNotes}
              onChange={(e) => setMeasureNotes(e.target.value)}
              placeholder="e.g. Measured before breakfast"
              className="w-full px-3.5 py-2.5 border border-[#E8E5EE] dark:border-slate-800 rounded-xl bg-[#F8F7FA] dark:bg-slate-900 text-[#15131D] dark:text-white focus:outline-hidden focus:border-purple-600"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setIsMeasureModalOpen(false)}
              className="px-4 py-2 font-bold text-xs text-[#686476] dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 font-bold text-xs text-white bg-purple-600 hover:bg-purple-500 rounded-xl shadow-md shadow-purple-600/25 transition-all cursor-pointer"
            >
              Record Measurement
            </button>
          </div>
        </form>
      </Modal>

      {/* New Milestone Modal */}
      <Modal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        title="Create Fitness Milestone"
        subtitle="Establish concrete targets for weight, strength, or attendance"
      >
        <form onSubmit={handleCreateGoal} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-[#15131D] dark:text-white mb-1.5">Milestone Title</label>
            <input
              type="text"
              required
              value={goalTitle}
              onChange={(e) => setGoalTitle(e.target.value)}
              placeholder="e.g. Reach 70kg Body Weight"
              className="w-full px-3.5 py-2.5 border border-[#E8E5EE] dark:border-slate-800 rounded-xl bg-[#F8F7FA] dark:bg-slate-900 text-[#15131D] dark:text-white focus:outline-hidden focus:border-purple-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#15131D] dark:text-white mb-1.5">Category</label>
              <select
                value={goalCategory}
                onChange={(e) => setGoalCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-[#E8E5EE] dark:border-slate-800 rounded-xl bg-[#F8F7FA] dark:bg-slate-900 text-[#15131D] dark:text-white focus:outline-hidden focus:border-purple-600"
              >
                <option value="Weight">Weight</option>
                <option value="Strength">Strength</option>
                <option value="Attendance">Attendance</option>
                <option value="Habit">Habit</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-[#15131D] dark:text-white mb-1.5">Target Date</label>
              <input
                type="date"
                required
                value={goalDate}
                onChange={(e) => setGoalDate(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-[#E8E5EE] dark:border-slate-800 rounded-xl bg-[#F8F7FA] dark:bg-slate-900 text-[#15131D] dark:text-white focus:outline-hidden focus:border-purple-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-[#15131D] dark:text-white mb-1.5">Target Value</label>
              <input
                type="number"
                step="0.5"
                required
                value={goalTarget}
                onChange={(e) => setGoalTarget(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 border border-[#E8E5EE] dark:border-slate-800 rounded-xl bg-[#F8F7FA] dark:bg-slate-900 text-[#15131D] dark:text-white focus:outline-hidden focus:border-purple-600"
              />
            </div>
            <div>
              <label className="block font-bold text-[#15131D] dark:text-white mb-1.5">Current Value</label>
              <input
                type="number"
                step="0.5"
                value={goalCurrent}
                onChange={(e) => setGoalCurrent(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 border border-[#E8E5EE] dark:border-slate-800 rounded-xl bg-[#F8F7FA] dark:bg-slate-900 text-[#15131D] dark:text-white focus:outline-hidden focus:border-purple-600"
              />
            </div>
            <div>
              <label className="block font-bold text-[#15131D] dark:text-white mb-1.5">Unit</label>
              <input
                type="text"
                value={goalUnit}
                onChange={(e) => setGoalUnit(e.target.value)}
                placeholder="kg, reps, etc."
                className="w-full px-3.5 py-2.5 border border-[#E8E5EE] dark:border-slate-800 rounded-xl bg-[#F8F7FA] dark:bg-slate-900 text-[#15131D] dark:text-white focus:outline-hidden focus:border-purple-600"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setIsGoalModalOpen(false)}
              className="px-4 py-2 font-bold text-xs text-[#686476] dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 font-bold text-xs text-white bg-purple-600 hover:bg-purple-500 rounded-xl shadow-md shadow-purple-600/25 transition-all cursor-pointer"
            >
              Set Milestone
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
