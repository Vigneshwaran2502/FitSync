import { useState } from "react";
import { Lock, MapPin, CheckCircle2 } from "lucide-react";
import { authApi } from "../../api/authApi";
const AdminSettings = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState(null);
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      await authApi.updateProfile({ currentPassword, password: newPassword });
      setFeedback("Password successfully updated.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setFeedback(null), 5e3);
    } catch (err) {
      setError(err.response?.data?.message || "Error updating password.");
    } finally {
      setIsLoading(false);
    }
  };
  return <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#15131D] dark:text-white tracking-tight">Facility & Security Settings</h1>
        <p className="text-xs text-[#686476] dark:text-slate-400 mt-1">Manage administrative credentials, security rules, and geolocation telemetry</p>
      </div>

      {feedback && <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 rounded-2xl text-xs font-semibold flex items-center gap-2 theme-transition">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{feedback}</span>
        </div>}

      {error && <div className="p-4 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300 rounded-2xl text-xs font-semibold theme-transition">
          {error}
        </div>}

      {
    /* Geolocation Verification Anchor */
  }
      <div className="bg-white dark:bg-[#0b0d15] border border-[#E8E5EE] dark:border-slate-800 rounded-3xl p-6 shadow-[0_10px_30px_rgba(30,20,60,0.04)] dark:shadow-none theme-transition">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="p-2 bg-purple-50 dark:bg-purple-950/60 border border-purple-100 dark:border-purple-900/60 rounded-xl text-purple-600 dark:text-purple-400">
            <MapPin className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-bold text-[#15131D] dark:text-white">Attendance GPS Geolocation Parameters</h2>
        </div>
        <p className="text-xs text-[#686476] dark:text-slate-400 leading-relaxed mb-5">
          All member GPS check-ins are rigorously verified against this geofence center using the Haversine formula on the backend.
        </p>

        <div className="mb-4 p-4 bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-800/60 rounded-2xl flex items-start gap-3 theme-transition">
          <MapPin className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 shrink-0" />
          <div className="text-xs">
            <span className="font-bold text-[#15131D] dark:text-white">Easwari Engineering College Address</span>
            <p className="text-[#686476] dark:text-slate-300 mt-0.5">Bharathi Salai, Ramapuram, Chennai, Tamil Nadu 600089, India</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 bg-[#F8F7FA] dark:bg-slate-900/80 border border-[#E8E5EE] dark:border-slate-800 rounded-2xl theme-transition">
            <span className="text-[11px] text-[#8E8A9C] dark:text-slate-400 font-medium">Gym Center Latitude</span>
            <p className="font-mono font-bold text-[#15131D] dark:text-white mt-1 tabular-nums">13.033500° N</p>
          </div>
          <div className="p-3.5 bg-[#F8F7FA] dark:bg-slate-900/80 border border-[#E8E5EE] dark:border-slate-800 rounded-2xl theme-transition">
            <span className="text-[11px] text-[#8E8A9C] dark:text-slate-400 font-medium">Gym Center Longitude</span>
            <p className="font-mono font-bold text-[#15131D] dark:text-white mt-1 tabular-nums">80.185500° E</p>
          </div>
          <div className="p-3.5 bg-[#F8F7FA] dark:bg-slate-900/80 border border-[#E8E5EE] dark:border-slate-800 rounded-2xl theme-transition">
            <span className="text-[11px] text-[#8E8A9C] dark:text-slate-400 font-medium">Allowed Check-in Radius</span>
            <p className="font-mono font-bold text-purple-600 dark:text-purple-400 mt-1 tabular-nums">1,000 Meters (1.0 km)</p>
          </div>
        </div>
      </div>

      {
    /* Admin Security Settings */
  }
      <div className="bg-white dark:bg-[#0b0d15] border border-[#E8E5EE] dark:border-slate-800 rounded-3xl p-6 shadow-[0_10px_30px_rgba(30,20,60,0.04)] dark:shadow-none theme-transition">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="p-2 bg-purple-50 dark:bg-purple-950/60 border border-purple-100 dark:border-purple-900/60 rounded-xl text-purple-600 dark:text-purple-400">
            <Lock className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-bold text-[#15131D] dark:text-white">Administrative Security & Credentials</h2>
        </div>
        <p className="text-xs text-[#686476] dark:text-slate-400 mb-5">Update administrator password and security credentials</p>

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md text-xs">
          <div>
            <label className="block font-bold text-[#15131D] dark:text-white mb-1.5">Current Password</label>
            <input
    type="password"
    required
    value={currentPassword}
    onChange={(e) => setCurrentPassword(e.target.value)}
    className="w-full px-3.5 py-2.5 border border-[#E8E5EE] dark:border-slate-800 rounded-xl bg-[#F8F7FA] dark:bg-slate-900 text-[#15131D] dark:text-white focus:outline-hidden focus:border-purple-600"
    placeholder="••••••••"
  />
          </div>

          <div>
            <label className="block font-bold text-[#15131D] dark:text-white mb-1.5">New Password</label>
            <input
    type="password"
    required
    value={newPassword}
    onChange={(e) => setNewPassword(e.target.value)}
    className="w-full px-3.5 py-2.5 border border-[#E8E5EE] dark:border-slate-800 rounded-xl bg-[#F8F7FA] dark:bg-slate-900 text-[#15131D] dark:text-white focus:outline-hidden focus:border-purple-600"
    placeholder="Min 6 characters"
  />
          </div>

          <div>
            <label className="block font-bold text-[#15131D] dark:text-white mb-1.5">Confirm New Password</label>
            <input
    type="password"
    required
    value={confirmPassword}
    onChange={(e) => setConfirmPassword(e.target.value)}
    className="w-full px-3.5 py-2.5 border border-[#E8E5EE] dark:border-slate-800 rounded-xl bg-[#F8F7FA] dark:bg-slate-900 text-[#15131D] dark:text-white focus:outline-hidden focus:border-purple-600"
    placeholder="••••••••"
  />
          </div>

          <button
    type="submit"
    disabled={isLoading}
    className="px-5 py-2.5 font-bold text-xs text-white bg-purple-600 hover:bg-purple-500 disabled:opacity-60 rounded-xl shadow-md shadow-purple-600/25 transition-all cursor-pointer"
  >
            {isLoading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>;
};
export {
  AdminSettings
};
