import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { RefreshCw, ShieldCheck, MapPin, Clock } from "lucide-react";
import { attendanceApi } from "../../api/attendanceApi";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
const AdminQRScreen = () => {
  const [session, setSession] = useState(null);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [error, setError] = useState(null);
  const fetchSession = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await attendanceApi.getActiveQRSession();
      setSession(res.session);
      const exp = new Date(res.session.expiresAt).getTime();
      const diff = Math.max(0, Math.floor((exp - Date.now()) / 1e3));
      setTimeLeftSeconds(diff);
    } catch (err) {
      setError(err.response?.data?.message || "Error loading QR station.");
    } finally {
      setIsLoading(false);
    }
  };
  const handleRegenerate = async () => {
    try {
      setIsRegenerating(true);
      const res = await attendanceApi.generateNewQRSession();
      setSession(res.session);
      const exp = new Date(res.session.expiresAt).getTime();
      const diff = Math.max(0, Math.floor((exp - Date.now()) / 1e3));
      setTimeLeftSeconds(diff);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to regenerate session");
    } finally {
      setIsRegenerating(false);
    }
  };
  useEffect(() => {
    fetchSession();
  }, []);
  useEffect(() => {
    if (timeLeftSeconds <= 0) return;
    const interval = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1e3);
    return () => clearInterval(interval);
  }, [timeLeftSeconds]);
  const formatCountdown = (totalSec) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };
  if (isLoading) {
    return <LoadingSpinner message="Connecting to secure QR attendance authority..." />;
  }
  const isExpired = timeLeftSeconds <= 0;
  return <div className="max-w-2xl mx-auto py-6">
      <div className="bg-white dark:bg-[#0b0d15] border border-[#E8E5EE] dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-[0_20px_50px_rgba(30,20,60,0.06)] dark:shadow-2xl dark:shadow-purple-950/40 text-center theme-transition">
        {
    /* Badge & Title */
  }
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-[10px] font-extrabold uppercase tracking-wider mb-4 shadow-2xs">
          <ShieldCheck className="w-3.5 h-3.5 text-lime-500" />
          <span>Front Desk Attendance Terminal</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-[#15131D] dark:text-white tracking-tight">Scan for Instant Check-in</h1>
        <p className="text-xs text-[#686476] dark:text-slate-400 mt-1 max-w-md mx-auto">
          Members scan this code with their FitSync digital pass. Verified cryptographically with rolling time-based security.
        </p>

        {
    /* QR Frame Container */
  }
        <div className="my-8 flex flex-col items-center justify-center">
          <div
    className={`p-6 bg-white dark:bg-slate-900 border-2 rounded-3xl shadow-sm transition-all duration-300 relative ${isExpired ? "border-dashed border-rose-300 opacity-60" : "border-purple-500 shadow-purple-50 dark:shadow-purple-950/50"}`}
  >
            {session ? <QRCodeSVG
    value={session.code}
    size={240}
    level="H"
    includeMargin={true}
    fgColor="#0f172a"
  /> : <div className="w-60 h-60 flex items-center justify-center text-[#8E8A9C] dark:text-slate-500 text-xs">
                No active session
              </div>}

            {isExpired && <div className="absolute inset-0 bg-white/90 dark:bg-slate-950/90 backdrop-blur-2xs rounded-3xl flex flex-col items-center justify-center p-4">
                <p className="text-xs font-bold text-rose-600 mb-1">Session Expired</p>
                <p className="text-[11px] text-[#686476] dark:text-slate-400 text-center mb-3">Please regenerate a new rolling QR token.</p>
                <button
    onClick={handleRegenerate}
    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/25 cursor-pointer"
  >
                  Regenerate QR
                </button>
              </div>}
          </div>

          {
    /* Session Token Display for Testing / Manual verification */
  }
          {session && <div className="mt-4 flex items-center gap-2">
              <span className="text-[11px] text-[#8E8A9C] dark:text-slate-400 font-medium">Session Token:</span>
              <code className="text-xs font-mono font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950 px-2.5 py-0.5 rounded-lg border border-purple-200 dark:border-purple-800">
                {session.code}
              </code>
            </div>}
        </div>

        {
    /* Countdown & Security Status */
  }
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-xs">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50/70 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl theme-transition">
            <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="text-[#686476] dark:text-slate-400 font-bold">Expires in:</span>
            <span className={`font-mono font-bold tabular-nums ${isExpired ? "text-rose-600" : "text-[#15131D] dark:text-white"}`}>
              {formatCountdown(timeLeftSeconds)}
            </span>
          </div>

          <div className="flex items-center gap-2.5 px-4 py-2.5 bg-slate-50/70 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl theme-transition">
            <MapPin className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
            <div className="text-left">
              <span className="text-[#15131D] dark:text-white font-bold">{session?.gymName || "Easwari Engineering College"}</span>
              <p className="text-[10px] text-[#686476] dark:text-slate-400">{session?.gymAddress || "Bharathi Salai, Ramapuram, Chennai, Tamil Nadu 600089, India"}</p>
            </div>
          </div>
        </div>

        {
    /* Regenerate Action */
  }
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/5 flex justify-center">
          <button
    onClick={handleRegenerate}
    disabled={isRegenerating}
    className="flex items-center gap-2 px-6 py-3 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 disabled:opacity-60 rounded-xl shadow-md shadow-purple-600/25 transition-all cursor-pointer"
  >
            <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? "animate-spin" : ""}`} />
            <span>{isRegenerating ? "Regenerating..." : "Regenerate QR Session Code"}</span>
          </button>
        </div>
      </div>
    </div>;
};
export {
  AdminQRScreen
};
