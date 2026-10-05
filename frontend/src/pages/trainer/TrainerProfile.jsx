import { useState, useEffect } from "react";
import { Save, CheckCircle2 } from "lucide-react";
import { trainerApi } from "../../api/trainerApi";
import { useAuth } from "../../context/AuthContext";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
const TrainerProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [specializations, setSpecializations] = useState("");
  const [experienceYears, setExperienceYears] = useState(3);
  const [hourlyRate, setHourlyRate] = useState(60);
  const [bio, setBio] = useState("");
  const [certifications, setCertifications] = useState("");
  useEffect(() => {
    const fetchTrainer = async () => {
      try {
        setIsLoading(true);
        if (user?.id) {
          const res = await trainerApi.getTrainerById(user.id);
          const p = res.profile;
          setProfile(p);
          if (p) {
            setSpecializations(p.specialization?.join(", ") || "");
            setExperienceYears(p.experienceYears || 3);
            setHourlyRate(p.hourlyRate || 60);
            setBio(p.bio || "");
            setCertifications(p.certifications?.join(", ") || "");
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrainer();
  }, [user]);
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await trainerApi.updateProfile({
        specialization: specializations.split(",").map((s) => s.trim()).filter(Boolean),
        experienceYears: Number(experienceYears),
        hourlyRate: Number(hourlyRate),
        bio,
        certifications: certifications.split(",").map((c) => c.trim()).filter(Boolean)
      });
      setFeedback("Trainer profile updated successfully.");
      setTimeout(() => setFeedback(null), 4e3);
    } catch (err) {
      alert(err.response?.data?.message || "Error updating profile");
    } finally {
      setIsSaving(false);
    }
  };
  if (isLoading) {
    return <LoadingSpinner message="Retrieving professional profile..." />;
  }
  return <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#15131D] dark:text-white tracking-tight">
          Trainer Professional Profile
        </h1>
        <p className="text-xs sm:text-sm text-[#686476] dark:text-slate-400 mt-1">
          Manage coaching credentials, client consultation rates, and bio
        </p>
      </div>

      {feedback && <div className="p-4 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 text-purple-900 dark:text-purple-300 rounded-2xl text-xs font-semibold flex items-center gap-2.5 theme-transition">
          <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
          <span>{feedback}</span>
        </div>}

      <form onSubmit={handleSave} className="bg-white dark:bg-[#0b0d14] border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5 text-xs theme-transition">
        <div>
          <label className="block text-xs font-bold text-[#15131D] dark:text-white mb-1.5">
            Specializations (Comma separated)
          </label>
          <input
    type="text"
    required
    value={specializations}
    onChange={(e) => setSpecializations(e.target.value)}
    placeholder="e.g. Strength & Conditioning, Hypertrophy, Mobility"
    className="w-full px-3.5 py-2.5 text-xs bg-slate-50/70 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-[#15131D] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 dark:focus:border-purple-400 transition-colors"
  />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#15131D] dark:text-white mb-1.5">
              Years of Coaching Experience
            </label>
            <input
    type="number"
    min={0}
    value={experienceYears}
    onChange={(e) => setExperienceYears(Number(e.target.value))}
    className="w-full px-3.5 py-2.5 text-xs bg-slate-50/70 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-[#15131D] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 dark:focus:border-purple-400 transition-colors"
  />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#15131D] dark:text-white mb-1.5">
              Session Hourly Rate ($ USD)
            </label>
            <input
    type="number"
    min={0}
    value={hourlyRate}
    onChange={(e) => setHourlyRate(Number(e.target.value))}
    className="w-full px-3.5 py-2.5 text-xs bg-slate-50/70 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-[#15131D] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 dark:focus:border-purple-400 transition-colors"
  />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#15131D] dark:text-white mb-1.5">
            Professional Certifications
          </label>
          <input
    type="text"
    value={certifications}
    onChange={(e) => setCertifications(e.target.value)}
    placeholder="e.g. NSCA-CSCS, NASM-CPT, Precision Nutrition L1"
    className="w-full px-3.5 py-2.5 text-xs bg-slate-50/70 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-[#15131D] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 dark:focus:border-purple-400 transition-colors"
  />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#15131D] dark:text-white mb-1.5">
            Biography & Training Philosophy
          </label>
          <textarea
    rows={4}
    value={bio}
    onChange={(e) => setBio(e.target.value)}
    placeholder="Describe your coaching methodology and background..."
    className="w-full px-3.5 py-2.5 text-xs bg-slate-50/70 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-[#15131D] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 dark:focus:border-purple-400 leading-relaxed transition-colors"
  />
        </div>

        <div className="pt-2 flex justify-end">
          <button
    type="submit"
    disabled={isSaving}
    className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 disabled:opacity-60 rounded-xl shadow-md shadow-purple-600/25 transition-all cursor-pointer"
  >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "Saving..." : "Save Profile"}</span>
          </button>
        </div>
      </form>
    </div>;
};
export {
  TrainerProfilePage
};
