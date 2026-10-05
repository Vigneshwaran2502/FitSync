import { useState, useEffect } from "react";
import { Bell, CheckCheck, Trash2, Dumbbell, Award, Calendar, AlertCircle } from "lucide-react";
import { notificationApi } from "../../api/notificationApi";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
const MemberNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const fetchNotifs = async () => {
    try {
      setIsLoading(true);
      const res = await notificationApi.getNotifications({ unread: filter === "unread" });
      setNotifications(res.notifications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchNotifs();
  }, [filter]);
  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };
  const handleMarkRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };
  const handleDelete = async (id) => {
    try {
      await notificationApi.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error(err);
    }
  };
  const getIcon = (type) => {
    switch (type) {
      case "workout":
        return <Dumbbell className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      case "goal":
        return <Award className="w-4 h-4 text-amber-500" />;
      case "appointment":
        return <Calendar className="w-4 h-4 text-blue-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
    }
  };
  return <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#15131D] dark:text-white tracking-tight">
            Notification Center
          </h1>
          <p className="text-xs sm:text-sm text-[#686476] dark:text-slate-400 mt-1">
            Stay updated with workout assignments, goal milestones, and gym announcements
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-xl">
            <button
    onClick={() => setFilter("all")}
    className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${filter === "all" ? "bg-white dark:bg-white/10 text-purple-600 dark:text-purple-400 shadow-xs" : "text-[#686476] dark:text-slate-400 hover:text-[#15131D] dark:hover:text-white"}`}
  >
              All
            </button>
            <button
    onClick={() => setFilter("unread")}
    className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${filter === "unread" ? "bg-white dark:bg-white/10 text-purple-600 dark:text-purple-400 shadow-xs" : "text-[#686476] dark:text-slate-400 hover:text-[#15131D] dark:hover:text-white"}`}
  >
              Unread
            </button>
          </div>

          <button
    onClick={handleMarkAllRead}
    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#15131D] dark:text-white hover:text-purple-600 dark:hover:text-purple-400 bg-white dark:bg-[#0b0d14] border border-slate-200/80 dark:border-white/10 rounded-xl hover:border-purple-500/50 transition-colors shadow-xs cursor-pointer"
  >
            <CheckCheck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>Mark All Read</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0b0d14] border border-slate-200/80 dark:border-white/10 rounded-3xl overflow-hidden shadow-xs theme-transition">
        {isLoading ? <LoadingSpinner message="Retrieving notifications..." /> : notifications.length === 0 ? <div className="p-12 text-center text-xs text-[#686476] dark:text-slate-400">
            <Bell className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="font-bold text-[#15131D] dark:text-white text-sm">No notifications to display</p>
            <p className="mt-1">You are completely up to date.</p>
          </div> : <div className="divide-y divide-slate-100 dark:divide-white/5">
            {notifications.map((n) => <div
    key={n._id}
    className={`p-5 flex items-start justify-between gap-4 transition-colors ${!n.isRead ? "bg-purple-50/40 dark:bg-purple-950/20" : "hover:bg-slate-50/60 dark:hover:bg-white/[0.02]"}`}
  >
                <div className="flex items-start gap-3.5">
                  <div className="p-3 bg-purple-50 dark:bg-purple-950/50 rounded-2xl shrink-0 mt-0.5 border border-purple-200/50 dark:border-purple-800/50">
                    {getIcon(n.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs ${!n.isRead ? "font-bold text-[#15131D] dark:text-white" : "font-medium text-[#686476] dark:text-slate-300"}`}>
                        {n.title}
                      </span>
                      {!n.isRead && <span className="w-2 h-2 rounded-full bg-purple-600 dark:bg-purple-400 shrink-0" />}
                    </div>
                    <p className="text-xs text-[#686476] dark:text-slate-400 mt-1 leading-relaxed">{n.message}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5 tabular-nums font-mono">
                      {new Date(n.createdAt).toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!n.isRead && <button
    onClick={() => handleMarkRead(n._id)}
    className="px-2.5 py-1 text-xs font-bold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/50 rounded-lg transition-colors cursor-pointer"
    title="Mark as read"
  >
                      Read
                    </button>}
                  <button
    onClick={() => handleDelete(n._id)}
    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
    title="Delete notification"
  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>)}
          </div>}
      </div>
    </div>;
};
export {
  MemberNotifications
};
