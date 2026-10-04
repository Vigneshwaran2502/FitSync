import React, { useState } from 'react';
import { Save, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api/authApi';

export const MemberSettings: React.FC = () => {
  const { user, updateUserData } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    if (newPassword && newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      const res = await authApi.updateProfile({
        name,
        phone,
        password: newPassword || undefined,
        currentPassword: currentPassword || undefined,
      });

      updateUserData({ name: res.user.name, phone: res.user.phone });
      setFeedback('Account details updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error updating account details');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#15131D] dark:text-white tracking-tight">
          Account & Security Settings
        </h1>
        <p className="text-xs sm:text-sm text-[#686476] dark:text-slate-400 mt-1">
          Manage your contact information and login credentials
        </p>
      </div>

      {feedback && (
        <div className="p-4 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 text-purple-900 dark:text-purple-300 rounded-2xl text-xs font-semibold flex items-center gap-2.5 theme-transition">
          <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-400 rounded-2xl text-xs font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleUpdate} className="bg-white dark:bg-[#0b0d14] border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5 text-xs theme-transition">
        <div>
          <label className="block text-xs font-bold text-[#15131D] dark:text-white mb-1.5">Full Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs bg-slate-50/70 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-[#15131D] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 dark:focus:border-purple-400 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#15131D] dark:text-white mb-1.5">Email Address</label>
          <input
            type="email"
            disabled
            value={user?.email || ''}
            className="w-full px-3.5 py-2.5 text-xs border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-500 rounded-xl cursor-not-allowed font-medium"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#15131D] dark:text-white mb-1.5">Contact Phone</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 (555) 000-0000"
            className="w-full px-3.5 py-2.5 text-xs bg-slate-50/70 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-[#15131D] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 dark:focus:border-purple-400 transition-colors"
          />
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-white/5">
          <h3 className="font-bold text-[#15131D] dark:text-white mb-3 text-sm">Change Password (Optional)</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#15131D] dark:text-white mb-1.5">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50/70 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-[#15131D] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 dark:focus:border-purple-400 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#15131D] dark:text-white mb-1.5">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50/70 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-[#15131D] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 dark:focus:border-purple-400 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#15131D] dark:text-white mb-1.5">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50/70 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-[#15131D] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 dark:focus:border-purple-400 transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 disabled:opacity-60 rounded-xl shadow-md shadow-purple-600/25 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
