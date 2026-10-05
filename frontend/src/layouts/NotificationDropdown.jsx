import { useState, useEffect, useRef } from "react";
import { Bell, CheckCheck, Dumbbell, Award, Calendar, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { notificationApi } from "../api/notificationApi";
import { useAuth } from "../context/AuthContext";
const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const fetchNotifs = async (retries = 1) => {
    try {
      setIsLoading(true);
      const res = await notificationApi.getNotifications();
      setNotifications(res.notifications || []);
      setUnreadCount(res.unreadCount || 0);
    } catch {
      if (retries > 0) {
        setTimeout(() => fetchNotifs(retries - 1), 1200);
        return;
      }
      setNotifications((prev) => prev || []);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchNotifs(2);
    const interval = setInterval(() => fetchNotifs(0), 3e4);
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const handleMarkAsRead = async (id, actionUrl) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount((c) => Math.max(0, c - 1));
      if (actionUrl) {
        setIsOpen(false);
        navigate(actionUrl);
      }
    } catch (err) {
      console.error(err);
    }
  };
  const handleMarkAll = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };
  const getNotificationIcon = (type) => {
    switch (type) {
      case "workout":
        return <Dumbbell className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      case "goal":
        return <Award className="w-4 h-4 text-lime-600 dark:text-lime-400" />;
      case "appointment":
        return <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      case "subscription":
      case "announcement":
      default:
        return <AlertCircle className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
    }
  };
  const rolePath = user?.role === "admin" ? "/admin/notifications" : user?.role === "trainer" ? "/trainer/notifications" : "/member/notifications";
  return <div className="relative" ref={dropdownRef}>
      <button
    onClick={() => setIsOpen(!isOpen)}
    className="relative p-2 rounded-xl text-[#8E8A9C] hover:text-[#15131D] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
    aria-label="Notifications"
  >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-purple-600 rounded-full ring-2 ring-white dark:ring-slate-900" />}
      </button>

      {isOpen && <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#0b0d15] border border-[#E8E5EE] dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden theme-transition">
          {
    /* Header */
  }
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#E8E5EE] dark:border-slate-800 bg-[#F8F7FA] dark:bg-slate-950/80 theme-transition">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#15131D] dark:text-white tracking-tight">Notifications</span>
              {unreadCount > 0 && <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {unreadCount} new
                </span>}
            </div>
            {unreadCount > 0 && <button
    onClick={handleMarkAll}
    className="text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 flex items-center gap-1 cursor-pointer"
  >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>}
          </div>

          {
    /* List */
  }
          <div className="max-h-80 overflow-y-auto divide-y divide-[#E8E5EE] dark:divide-slate-800/80">
            {isLoading ? <div className="p-6 text-center text-xs text-[#8E8A9C] dark:text-slate-400">Loading notifications...</div> : notifications.length === 0 ? <div className="p-8 text-center">
                <Bell className="w-6 h-6 text-[#8E8A9C] dark:text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-[#686476] dark:text-slate-400">No notifications yet</p>
              </div> : notifications.slice(0, 5).map((notif) => <div
    key={notif._id}
    onClick={() => handleMarkAsRead(notif._id, notif.actionUrl)}
    className={`p-3.5 text-left transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/60 flex items-start gap-3 ${!notif.isRead ? "bg-purple-50/40 dark:bg-purple-950/20" : ""}`}
  >
                  <div className="p-2 bg-purple-50 dark:bg-purple-950/60 rounded-xl shrink-0 mt-0.5">
                    {getNotificationIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className={`text-xs truncate ${!notif.isRead ? "font-bold text-[#15131D] dark:text-white" : "text-[#686476] dark:text-slate-300"}`}>
                        {notif.title}
                      </p>
                      {!notif.isRead && <span className="w-1.5 h-1.5 rounded-full bg-purple-600 shrink-0" />}
                    </div>
                    <p className="text-[11px] text-[#686476] dark:text-slate-400 line-clamp-2 mt-0.5 leading-snug">
                      {notif.message}
                    </p>
                    <p className="text-[10px] text-[#8E8A9C] dark:text-slate-400 mt-1">
                      {new Date(notif.createdAt).toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>)}
          </div>

          {
    /* Footer */
  }
          <div className="p-2.5 border-t border-[#E8E5EE] dark:border-slate-800 bg-[#F8F7FA] dark:bg-slate-950/80 text-center theme-transition">
            <button
    onClick={() => {
      setIsOpen(false);
      navigate(rolePath);
    }}
    className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 block w-full py-1 cursor-pointer"
  >
              View all notifications &rarr;
            </button>
          </div>
        </div>}
    </div>;
};
export {
  NotificationDropdown
};
