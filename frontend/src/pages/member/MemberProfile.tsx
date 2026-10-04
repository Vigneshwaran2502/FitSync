import React, { useState, useEffect } from 'react';
import { Save, CheckCircle2 } from 'lucide-react';
import { progressApi } from '../../api/progressApi';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const MemberProfile: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const [heightCm, setHeightCm] = useState(175);
  const [currentWeightKg, setCurrentWeightKg] = useState(75);
  const [targetWeightKg, setTargetWeightKg] = useState(70);
  const [fitnessGoal, setFitnessGoal] = useState('General Health');
  const [fitnessLevel, setFitnessLevel] = useState('Beginner');
  const [medicalConditions, setMedicalConditions] = useState('');

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const res = await progressApi.getFitnessProfile();
      const p = res.profile;
      setProfile(p);
      if (p) {
        setHeightCm(p.heightCm || 175);
        setCurrentWeightKg(p.currentWeightKg || 75);
        setTargetWeightKg(p.targetWeightKg || 70);
        setFitnessGoal(p.fitnessGoal || 'General Health');
        setFitnessLevel(p.fitnessLevel || 'Beginner');
        setMedicalConditions(p.medicalConditions || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await progressApi.updateFitnessProfile({
        heightCm: Number(heightCm),
        currentWeightKg: Number(currentWeightKg),
        targetWeightKg: Number(targetWeightKg),
        fitnessGoal,
        fitnessLevel,
        medicalConditions,
      });

      setFeedback('Fitness profile updated successfully.');
      setTimeout(() => setFeedback(null), 4000);
      fetchProfile();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error updating profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Retrieving your biometric profile..." />;
  }

  const heightInMeters = (heightCm || 175) / 100;
  const computedBmi = (currentWeightKg / (heightInMeters * heightInMeters)).toFixed(1);

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#15131D] dark:text-white tracking-tight">Fitness Profile & Biometrics</h1>
        <p className="text-xs text-[#686476] dark:text-slate-400 mt-1">Manage your physical benchmarks, training goals, and health limitations</p>
      </div>

      {feedback && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 rounded-2xl text-xs font-semibold flex items-center gap-2 theme-transition">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Biometric Summary Banner */}
      <div className="grid grid-cols-3 gap-3 bg-white dark:bg-[#0b0d15] border border-[#E8E5EE] dark:border-slate-800 rounded-3xl p-5 shadow-[0_10px_30px_rgba(30,20,60,0.04)] dark:shadow-none text-xs theme-transition">
        <div>
          <span className="text-[11px] text-[#8E8A9C] dark:text-slate-400 uppercase tracking-wider font-medium">Calculated BMI</span>
          <p className="text-2xl font-black text-[#15131D] dark:text-white mt-1 font-mono tabular-nums">{computedBmi}</p>
          <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold">Standard Health Range</span>
        </div>
        <div>
          <span className="text-[11px] text-[#8E8A9C] dark:text-slate-400 uppercase tracking-wider font-medium">Target Delta</span>
          <p className="text-2xl font-black text-[#15131D] dark:text-white mt-1 tabular-nums font-mono">
            {targetWeightKg - currentWeightKg > 0 ? `+${(targetWeightKg - currentWeightKg).toFixed(1)}` : (targetWeightKg - currentWeightKg).toFixed(1)} kg
          </p>
          <span className="text-[10px] text-[#8E8A9C] dark:text-slate-400">To goal achievement</span>
        </div>
        <div>
          <span className="text-[11px] text-[#8E8A9C] dark:text-slate-400 uppercase tracking-wider font-medium">Assigned Coach</span>
          <p className="text-base font-bold text-[#15131D] dark:text-white mt-1 truncate">
            {profile?.assignedTrainerId?.name || 'Open Pool'}
          </p>
          <span className="text-[10px] text-[#8E8A9C] dark:text-slate-400">Dedicated Trainer</span>
        </div>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSave} className="bg-white dark:bg-[#0b0d15] border border-[#E8E5EE] dark:border-slate-800 rounded-3xl p-6 shadow-[0_10px_30px_rgba(30,20,60,0.04)] dark:shadow-none space-y-4 text-xs theme-transition">
        <div className="grid grid-cols-3 gap-3.5">
          <div>
            <label className="block font-bold text-[#15131D] dark:text-white mb-1.5">Height (cm)</label>
            <input
              type="number"
              min={100}
              max={250}
              value={heightCm}
              onChange={(e) => setHeightCm(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 border border-[#E8E5EE] dark:border-slate-800 rounded-xl bg-[#F8F7FA] dark:bg-slate-900 text-[#15131D] dark:text-white tabular-nums font-mono focus:outline-hidden focus:border-purple-600"
            />
          </div>
          <div>
            <label className="block font-bold text-[#15131D] dark:text-white mb-1.5">Current Weight (kg)</label>
            <input
              type="number"
              step="0.5"
              min={30}
              value={currentWeightKg}
              onChange={(e) => setCurrentWeightKg(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 border border-[#E8E5EE] dark:border-slate-800 rounded-xl bg-[#F8F7FA] dark:bg-slate-900 text-[#15131D] dark:text-white tabular-nums font-mono focus:outline-hidden focus:border-purple-600"
            />
          </div>
          <div>
            <label className="block font-bold text-[#15131D] dark:text-white mb-1.5">Target Weight (kg)</label>
            <input
              type="number"
              step="0.5"
              min={30}
              value={targetWeightKg}
              onChange={(e) => setTargetWeightKg(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 border border-[#E8E5EE] dark:border-slate-800 rounded-xl bg-[#F8F7FA] dark:bg-slate-900 text-[#15131D] dark:text-white tabular-nums font-mono focus:outline-hidden focus:border-purple-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-[#15131D] dark:text-white mb-1.5">Primary Fitness Goal</label>
            <select
              value={fitnessGoal}
              onChange={(e) => setFitnessGoal(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-[#E8E5EE] dark:border-slate-800 rounded-xl bg-[#F8F7FA] dark:bg-slate-900 text-[#15131D] dark:text-white focus:outline-hidden focus:border-purple-600"
            >
              <option value="Weight Loss">Weight Loss</option>
              <option value="Muscle Gain">Muscle Gain</option>
              <option value="Endurance">Endurance</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Flexibility">Flexibility</option>
              <option value="General Health">General Health</option>
            </select>
          </div>
          <div>
            <label className="block font-bold text-[#15131D] dark:text-white mb-1.5">Experience Level</label>
            <select
              value={fitnessLevel}
              onChange={(e) => setFitnessLevel(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-[#E8E5EE] dark:border-slate-800 rounded-xl bg-[#F8F7FA] dark:bg-slate-900 text-[#15131D] dark:text-white focus:outline-hidden focus:border-purple-600"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block font-bold text-[#15131D] dark:text-white mb-1.5">Medical Conditions or Limitations</label>
          <textarea
            rows={3}
            value={medicalConditions}
            onChange={(e) => setMedicalConditions(e.target.value)}
            placeholder="Injuries, previous surgeries, or conditions for trainers to note..."
            className="w-full px-3.5 py-2.5 border border-[#E8E5EE] dark:border-slate-800 rounded-xl bg-[#F8F7FA] dark:bg-slate-900 text-[#15131D] dark:text-white focus:outline-hidden focus:border-purple-600 leading-relaxed"
          />
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 font-bold text-xs text-white bg-purple-600 hover:bg-purple-500 disabled:opacity-60 rounded-xl shadow-md shadow-purple-600/25 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Profile'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
