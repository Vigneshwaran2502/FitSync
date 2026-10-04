import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Dumbbell, Target, Heart } from 'lucide-react';
import { progressApi } from '../../api/progressApi';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from '../../components/common/ThemeToggle';

export const MemberOnboarding: React.FC = () => {
  const [step, setStep] = useState(1);
  const [heightCm, setHeightCm] = useState(175);
  const [currentWeightKg, setCurrentWeightKg] = useState(75);
  const [targetWeightKg, setTargetWeightKg] = useState(70);
  const [gender, setGender] = useState<'male' | 'female' | 'other' | 'prefer_not_to_say'>('male');
  const [dateOfBirth, setDateOfBirth] = useState('1998-01-01');
  const [fitnessGoal, setFitnessGoal] = useState<'Weight Loss' | 'Muscle Gain' | 'Endurance' | 'Maintenance' | 'Flexibility' | 'General Health'>('Muscle Gain');
  const [fitnessLevel, setFitnessLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [medicalConditions, setMedicalConditions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { refreshUser } = useAuth();
  const navigate = useNavigate();

  const handleComplete = async () => {
    try {
      setIsSubmitting(true);
      await progressApi.updateFitnessProfile({
        heightCm: Number(heightCm),
        currentWeightKg: Number(currentWeightKg),
        targetWeightKg: Number(targetWeightKg),
        gender,
        dateOfBirth,
        fitnessGoal,
        fitnessLevel,
        medicalConditions,
        onboardingCompleted: true,
      });

      await refreshUser();
      navigate('/member/dashboard', { replace: true });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error saving onboarding profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] dark:bg-[#07080d] text-[#15131D] dark:text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 relative overflow-hidden theme-transition">
      {/* Ambient background glows */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-purple-600/10 dark:bg-purple-600/15 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-lime-400/10 blur-[100px] pointer-events-none rounded-full" />

      {/* Top Bar with Theme Toggle */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      <div className="max-w-xl w-full mx-auto relative z-10">
        {/* Progress Stepper Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-violet-500 to-lime-400 p-[1.5px] shadow-lg shadow-purple-600/25 mx-auto mb-3">
            <div className="w-full h-full bg-white dark:bg-[#0b0d14] rounded-[14px] flex items-center justify-center theme-transition">
              <Dumbbell className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#15131D] dark:text-white tracking-tight">
            Fitness Onboarding
          </h1>
          <p className="text-xs sm:text-sm text-[#686476] dark:text-slate-400 mt-1">
            Personalize your training baseline and objectives
          </p>

          <div className="flex items-center justify-center gap-2 mt-6">
            <span
              className={`h-1.5 rounded-full transition-all duration-300 ${
                step >= 1 ? 'w-10 bg-purple-600' : 'w-4 bg-slate-200 dark:bg-white/10'
              }`}
            />
            <span
              className={`h-1.5 rounded-full transition-all duration-300 ${
                step >= 2 ? 'w-10 bg-purple-600' : 'w-4 bg-slate-200 dark:bg-white/10'
              }`}
            />
            <span
              className={`h-1.5 rounded-full transition-all duration-300 ${
                step >= 3 ? 'w-10 bg-purple-600' : 'w-4 bg-slate-200 dark:bg-white/10'
              }`}
            />
          </div>
        </div>

        {/* Wizard Card */}
        <div className="bg-white dark:bg-[#0b0d14]/90 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl shadow-purple-500/5 theme-transition">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-[#15131D] dark:text-white">
                  Step 1: Physical Measurements
                </h2>
                <p className="text-xs text-[#686476] dark:text-slate-400 mt-0.5">
                  Provide your baseline measurements to calculate BMI and track changes.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-[#15131D] dark:text-white mb-1.5">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    min={100}
                    max={250}
                    value={heightCm}
                    onChange={(e) => setHeightCm(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50/70 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-[#15131D] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 dark:focus:border-purple-400 tabular-nums transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#15131D] dark:text-white mb-1.5">
                    Current Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min={30}
                    max={300}
                    value={currentWeightKg}
                    onChange={(e) => setCurrentWeightKg(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50/70 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-[#15131D] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 dark:focus:border-purple-400 tabular-nums transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#15131D] dark:text-white mb-1.5">
                    Target Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min={30}
                    max={300}
                    value={targetWeightKg}
                    onChange={(e) => setTargetWeightKg(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50/70 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-[#15131D] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 dark:focus:border-purple-400 tabular-nums transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#15131D] dark:text-white mb-1.5">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50/70 dark:bg-[#0b0d14] border border-slate-200 dark:border-white/10 rounded-xl text-[#15131D] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 dark:focus:border-purple-400 transition-colors"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#15131D] dark:text-white mb-1.5">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50/70 dark:bg-[#0b0d14] border border-slate-200 dark:border-white/10 rounded-xl text-[#15131D] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 dark:focus:border-purple-400 transition-colors"
                />
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl shadow-md shadow-purple-600/25 transition-all cursor-pointer"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-[#15131D] dark:text-white">
                  Step 2: Primary Goals & Fitness Experience
                </h2>
                <p className="text-xs text-[#686476] dark:text-slate-400 mt-0.5">
                  What would you like to achieve during your training at FitSync?
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#15131D] dark:text-white mb-2">
                  Primary Goal
                </label>
                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  {['Weight Loss', 'Muscle Gain', 'Endurance', 'Maintenance', 'Flexibility', 'General Health'].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setFitnessGoal(g as any)}
                      className={`p-3 text-left rounded-xl border font-bold transition-all cursor-pointer ${
                        fitnessGoal === g
                          ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 ring-2 ring-purple-600/30'
                          : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 text-[#686476] dark:text-slate-300 bg-white dark:bg-white/5'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#15131D] dark:text-white mb-1.5">
                  Fitness Experience Level
                </label>
                <select
                  value={fitnessLevel}
                  onChange={(e) => setFitnessLevel(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50/70 dark:bg-[#0b0d14] border border-slate-200 dark:border-white/10 rounded-xl text-[#15131D] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 dark:focus:border-purple-400 transition-colors"
                >
                  <option value="Beginner">Beginner (New to strength and conditioning)</option>
                  <option value="Intermediate">Intermediate (1–2 years regular gym workouts)</option>
                  <option value="Advanced">Advanced (Consistent multi-year lifting experience)</option>
                </select>
              </div>

              <div className="flex justify-between items-center pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 text-xs font-bold text-[#686476] dark:text-slate-400 hover:text-[#15131D] dark:hover:text-white transition-colors cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl shadow-md shadow-purple-600/25 transition-all cursor-pointer"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-[#15131D] dark:text-white">
                  Step 3: Health & Medical Notes
                </h2>
                <p className="text-xs text-[#686476] dark:text-slate-400 mt-0.5">
                  Please disclose any previous injuries, joint issues, or medical advice.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#15131D] dark:text-white mb-1.5">
                  Medical Conditions / Physical Limitations (Optional)
                </label>
                <textarea
                  rows={4}
                  value={medicalConditions}
                  onChange={(e) => setMedicalConditions(e.target.value)}
                  placeholder="e.g. Previous right knee surgery, lower back stiffness, asthma..."
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50/70 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-[#15131D] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 dark:focus:border-purple-400 leading-relaxed transition-colors"
                />
              </div>

              <div className="p-4 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 rounded-2xl text-xs text-purple-950 dark:text-purple-200 space-y-1 theme-transition">
                <p className="font-bold flex items-center gap-2 text-purple-700 dark:text-purple-300">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                  <span>Profile Baseline Ready</span>
                </p>
                <p className="text-[11px] text-purple-900/80 dark:text-purple-300/80 leading-relaxed">
                  Your BMI is estimated at{' '}
                  <strong className="font-mono text-purple-700 dark:text-purple-300 font-bold">
                    {(currentWeightKg / ((heightCm / 100) * (heightCm / 100))).toFixed(1)}
                  </strong>
                  . We will track your progress against your target weight of {targetWeightKg} kg.
                </p>
              </div>

              <div className="flex justify-between items-center pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2.5 text-xs font-bold text-[#686476] dark:text-slate-400 hover:text-[#15131D] dark:hover:text-white transition-colors cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleComplete}
                  className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 disabled:opacity-60 rounded-xl shadow-md shadow-purple-600/25 transition-all cursor-pointer"
                >
                  <span>{isSubmitting ? 'Saving Profile...' : 'Complete Onboarding'}</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
