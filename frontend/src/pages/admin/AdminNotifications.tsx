import React, { useState, useEffect } from 'react';
import { Send, CheckCircle2, Bell } from 'lucide-react';
import { notificationApi } from '../../api/notificationApi';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const AdminNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Broadcast state
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState('Everyone');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchNotifs = async () => {
    try {
      setIsLoading(true);
      const res = await notificationApi.getNotifications();
      setNotifications(res.notifications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;

    try {
      setIsBroadcasting(true);
      const res = await notificationApi.broadcastAnnouncement({ title, message, audience });
      setFeedback(res.message);
      setTitle('');
      setMessage('');
      fetchNotifs();
      setTimeout(() => setFeedback(null), 5000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error broadcasting announcement');
    } finally {
      setIsBroadcasting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationApi.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#15131D] dark:text-white tracking-tight">Facility Announcements & Alerts</h1>
        <p className="text-xs text-[#686476] dark:text-slate-400 mt-1">Broadcast priority alerts to gym members and staff</p>
      </div>

      {feedback && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 rounded-2xl text-xs font-semibold flex items-center justify-between theme-transition">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{feedback}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="cursor-pointer text-slate-400 hover:text-slate-700">✕</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Broadcast Sender Form */}
        <div className="bg-white dark:bg-[#0b0d15] border border-[#E8E5EE] dark:border-slate-800 rounded-3xl p-6 shadow-[0_10px_30px_rgba(30,20,60,0.04)] dark:shadow-none h-fit theme-transition">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="p-2 bg-purple-50 dark:bg-purple-950/60 border border-purple-100 dark:border-purple-900/60 rounded-xl text-purple-600 dark:text-purple-400">
              <Send className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-[#15131D] dark:text-white">Broadcast Announcement</h2>
          </div>

          <form onSubmit={handleBroadcast} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-[#15131D] dark:text-white mb-1.5">Target Audience</label>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-[#E8E5EE] dark:border-slate-800 rounded-xl bg-[#F8F7FA] dark:bg-slate-900 text-[#15131D] dark:text-white focus:outline-hidden focus:border-purple-600"
              >
                <option value="Everyone">Everyone (Members & Trainers)</option>
                <option value="Members">Members Only</option>
                <option value="Trainers">Trainers Only</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-[#15131D] dark:text-white mb-1.5">Announcement Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Facility Upgrades & New Squat Racks"
                className="w-full px-3.5 py-2.5 border border-[#E8E5EE] dark:border-slate-800 rounded-xl bg-[#F8F7FA] dark:bg-slate-900 text-[#15131D] dark:text-white focus:outline-hidden focus:border-purple-600"
              />
            </div>

            <div>
              <label className="block font-bold text-[#15131D] dark:text-white mb-1.5">Notice Message</label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Detail the announcement, dates, or operational changes..."
                className="w-full px-3.5 py-2.5 border border-[#E8E5EE] dark:border-slate-800 rounded-xl bg-[#F8F7FA] dark:bg-slate-900 text-[#15131D] dark:text-white focus:outline-hidden focus:border-purple-600 leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={isBroadcasting}
              className="w-full py-2.5 px-4 font-bold text-xs text-white bg-purple-600 hover:bg-purple-500 disabled:opacity-60 rounded-xl shadow-md shadow-purple-600/25 transition-all cursor-pointer"
            >
              {isBroadcasting ? 'Broadcasting...' : 'Broadcast Notice'}
            </button>
          </form>
        </div>

        {/* Notifications History List */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0b0d15] border border-[#E8E5EE] dark:border-slate-800 rounded-3xl p-6 shadow-[0_10px_30px_rgba(30,20,60,0.04)] dark:shadow-none theme-transition">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <h2 className="text-sm font-bold text-[#15131D] dark:text-white">Notification Log</h2>
          </div>

          {isLoading ? (
            <LoadingSpinner message="Fetching notifications..." />
          ) : notifications.length === 0 ? (
            <p className="text-xs text-[#8E8A9C] dark:text-slate-400 text-center py-8">No notifications recorded.</p>
          ) : (
            <div className="divide-y divide-[#E8E5EE] dark:divide-slate-800/80">
              {notifications.map((n) => (
                <div key={n._id} className="py-3.5 flex items-start justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#15131D] dark:text-white">{n.title}</span>
                      <span className="text-[10px] uppercase font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/60 px-2 py-0.5 rounded-full">
                        {n.type}
                      </span>
                    </div>
                    <p className="text-[#686476] dark:text-slate-300 mt-1 leading-relaxed">{n.message}</p>
                    <p className="text-[10px] text-[#8E8A9C] dark:text-slate-400 mt-1.5 tabular-nums font-mono">
                      {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(n._id)}
                    className="p-1 rounded-lg text-[#8E8A9C] hover:text-rose-600 dark:hover:text-rose-400 text-xs transition-colors cursor-pointer"
                    title="Delete notification"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
