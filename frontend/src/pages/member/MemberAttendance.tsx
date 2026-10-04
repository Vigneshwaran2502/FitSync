import React, { useState, useEffect } from 'react';
import { QrCode, MapPin, CheckCircle2, AlertTriangle, LogOut, Navigation } from 'lucide-react';
import { attendanceApi } from '../../api/attendanceApi';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const MemberAttendance: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'qr' | 'gps' | 'history'>('qr');
  const [qrCodeInput, setQrCodeInput] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [activeCheckIn, setActiveCheckIn] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchAttendance = async () => {
    try {
      setIsLoading(true);
      const res = await attendanceApi.getHistory();
      const records = res.records || [];
      setHistory(records);

      const todayStr = new Date().toISOString().split('T')[0];
      const todayRecord = records.find((r: any) => r.date === todayStr && r.status === 'present');
      setActiveCheckIn(todayRecord || null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const handleQRCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrCodeInput) return;

    try {
      setIsCheckingIn(true);
      setFeedback(null);
      const res = await attendanceApi.checkIn({
        verificationMethod: 'qr',
        qrCode: qrCodeInput.trim(),
      });
      setFeedback({ type: 'success', message: res.message });
      setQrCodeInput('');
      fetchAttendance();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Check-in failed. Please verify the QR code.',
      });
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleGPSCheckIn = async (customCoords?: { latitude: number; longitude: number }) => {
    setFeedback(null);

    if (customCoords) {
      // Direct coordinate submit
      try {
        setIsCheckingIn(true);
        const res = await attendanceApi.checkIn({
          verificationMethod: 'gps',
          latitude: customCoords.latitude,
          longitude: customCoords.longitude,
        });
        setFeedback({ type: 'success', message: res.message });
        fetchAttendance();
      } catch (err: any) {
        setFeedback({
          type: 'error',
          message: err.response?.data?.message || 'GPS verification failed.',
        });
      } finally {
        setIsCheckingIn(false);
      }
      return;
    }

    if (!navigator.geolocation) {
      setFeedback({
        type: 'error',
        message: 'Browser Geolocation is not supported on this device. Please use QR Code check-in.',
      });
      return;
    }

    setIsCheckingIn(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await attendanceApi.checkIn({
            verificationMethod: 'gps',
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
          setFeedback({ type: 'success', message: res.message });
          fetchAttendance();
        } catch (err: any) {
          setFeedback({
            type: 'error',
            message: err.response?.data?.message || 'GPS check-in rejected.',
          });
        } finally {
          setIsCheckingIn(false);
        }
      },
      (err) => {
        setIsCheckingIn(false);
        setFeedback({
          type: 'error',
          message: `Location permission denied (${err.message}). Please allow GPS permission in your browser or test with simulated coordinates below.`,
        });
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleCheckOut = async () => {
    try {
      setIsCheckingIn(true);
      setFeedback(null);
      const res = await attendanceApi.checkOut();
      setFeedback({ type: 'success', message: res.message });
      fetchAttendance();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Error checking out.',
      });
    } finally {
      setIsCheckingIn(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#15131D] dark:text-white tracking-tight">Facility Attendance & Check-in</h1>
        <p className="text-xs text-[#686476] dark:text-slate-400 mt-1">Verify your daily gym session via rolling QR code or GPS geofence</p>
      </div>

      {/* Active Check-in Banner */}
      {activeCheckIn && (
        <div className="p-5 bg-purple-50/80 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 theme-transition">
          <div className="flex items-center gap-3.5">
            <span className="w-3.5 h-3.5 rounded-full bg-lime-500 animate-pulse shrink-0" />
            <div>
              <p className="text-sm font-bold text-purple-950 dark:text-purple-100">You are currently checked in</p>
              <p className="text-xs text-purple-700 dark:text-purple-300 mt-0.5">
                Entry recorded at <strong className="font-mono tabular-nums">{activeCheckIn.checkInTime}</strong> via {activeCheckIn.verificationMethod.toUpperCase()}
              </p>
            </div>
          </div>

          <button
            onClick={handleCheckOut}
            disabled={isCheckingIn}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Check Out of Facility</span>
          </button>
        </div>
      )}

      {/* Feedback Message */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between theme-transition ${
            feedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="ml-2 font-bold cursor-pointer">✕</button>
        </div>
      )}

      {/* Tabs / Segmented Switcher */}
      <div className="flex items-center gap-1.5 p-1.5 bg-white dark:bg-[#0b0d15] border border-[#E8E5EE] dark:border-slate-800 rounded-2xl w-fit shadow-2xs theme-transition">
        <button
          onClick={() => setActiveTab('qr')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'qr'
              ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
              : 'text-[#686476] dark:text-slate-400 hover:text-[#15131D] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900/60'
          }`}
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>QR Verification</span>
        </button>
        <button
          onClick={() => setActiveTab('gps')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'gps'
              ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
              : 'text-[#686476] dark:text-slate-400 hover:text-[#15131D] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900/60'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>GPS Geofence</span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'history'
              ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
              : 'text-[#686476] dark:text-slate-400 hover:text-[#15131D] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900/60'
          }`}
        >
          <span>Attendance Log ({history.length})</span>
        </button>
      </div>

      {/* Tab 1: QR Verification */}
      {activeTab === 'qr' && (
        <div className="bg-white dark:bg-[#0b0d15] border border-[#E8E5EE] dark:border-slate-800 rounded-3xl p-6 shadow-[0_10px_30px_rgba(30,20,60,0.04)] dark:shadow-none max-w-lg space-y-4 theme-transition">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 rounded-2xl">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#15131D] dark:text-white tracking-tight">Scan Front Desk QR Code</h2>
              <p className="text-xs text-[#686476] dark:text-slate-400">Scan or enter the rolling code displayed on the gym terminal</p>
            </div>
          </div>

          <form onSubmit={handleQRCheckIn} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-[#15131D] dark:text-white mb-1.5">
                Enter QR Terminal Token
              </label>
              <input
                type="text"
                required
                value={qrCodeInput}
                onChange={(e) => setQrCodeInput(e.target.value)}
                placeholder="e.g. FITSYNC-M0X8K..."
                className="w-full px-3.5 py-2.5 text-xs border border-[#E8E5EE] dark:border-slate-800 rounded-xl font-mono focus:outline-hidden focus:border-purple-600 bg-[#F8F7FA] dark:bg-slate-900 text-[#15131D] dark:text-white"
              />
            </div>

            <button
              type="submit"
              disabled={isCheckingIn || !qrCodeInput}
              className="w-full py-2.5 px-4 font-bold text-xs text-white bg-purple-600 hover:bg-purple-500 disabled:opacity-50 rounded-xl shadow-md shadow-purple-600/25 transition-all cursor-pointer"
            >
              {isCheckingIn ? 'Verifying with Backend...' : 'Verify & Check In'}
            </button>
          </form>

          <div className="p-3.5 bg-[#F8F7FA] dark:bg-slate-900/80 border border-[#E8E5EE] dark:border-slate-800 rounded-2xl text-[11px] text-[#686476] dark:text-slate-400 leading-relaxed theme-transition">
            💡 Tip: Admins display the active terminal screen under <strong>Attendance QR Display</strong>. Codes refresh every 15 minutes.
          </div>
        </div>
      )}

      {/* Tab 2: GPS Geofence */}
      {activeTab === 'gps' && (
        <div className="bg-white dark:bg-[#0b0d15] border border-[#E8E5EE] dark:border-slate-800 rounded-3xl p-6 shadow-[0_10px_30px_rgba(30,20,60,0.04)] dark:shadow-none max-w-lg space-y-4 theme-transition">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 rounded-2xl">
              <Navigation className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#15131D] dark:text-white tracking-tight">GPS Geofence Location Verification</h2>
              <p className="text-xs text-[#686476] dark:text-slate-400">Validates your coordinates against FitSync Flagship via backend Haversine formula</p>
            </div>
          </div>

          <div className="p-4 bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-800/60 rounded-2xl flex items-start gap-3 theme-transition">
            <MapPin className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-[#15131D] dark:text-white">FitSync Flagship Center</span>
              <p className="text-[#686476] dark:text-slate-300 mt-0.5">1000 Market Street, San Francisco, CA 94102, USA</p>
              <p className="text-[11px] text-[#8E8A9C] dark:text-slate-400 font-mono mt-1">37.774900° N, -122.419400° W (Radius: 1.0 km)</p>
            </div>
          </div>

          <p className="text-xs text-[#686476] dark:text-slate-400 leading-relaxed">
            Your device will request browser location permissions. The backend server calculates the great-circle spherical distance to ensure you are within 1,000 meters of the facility.
          </p>

          <button
            onClick={() => handleGPSCheckIn()}
            disabled={isCheckingIn}
            className="w-full py-2.5 px-4 font-bold text-xs text-white bg-purple-600 hover:bg-purple-500 disabled:opacity-60 rounded-xl shadow-md shadow-purple-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <MapPin className="w-4 h-4" />
            <span>{isCheckingIn ? 'Calculating Distance...' : 'Check In with Current Location'}</span>
          </button>

          {/* Quick Simulation Options for testing */}
          <div className="pt-3 border-t border-[#E8E5EE] dark:border-slate-800">
            <p className="text-[11px] font-bold text-[#8E8A9C] dark:text-slate-400 uppercase tracking-wider mb-2">
              Verification Coordinates Simulation:
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleGPSCheckIn({ latitude: 37.7750, longitude: -122.4190 })}
                className="flex-1 py-2 px-2.5 bg-[#F8F7FA] dark:bg-slate-900 hover:bg-purple-50 dark:hover:bg-purple-950/50 text-[#15131D] dark:text-white text-[11px] font-bold rounded-xl border border-[#E8E5EE] dark:border-slate-800 transition-colors cursor-pointer"
              >
                Inside Gym (25m away)
              </button>
              <button
                type="button"
                onClick={() => handleGPSCheckIn({ latitude: 34.0522, longitude: -118.2437 })}
                className="flex-1 py-2 px-2.5 bg-[#F8F7FA] dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-[#15131D] dark:text-white text-[11px] font-bold rounded-xl border border-[#E8E5EE] dark:border-slate-800 transition-colors cursor-pointer"
              >
                Far Away (Outside)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: History */}
      {activeTab === 'history' && (
        <div className="bg-white dark:bg-[#0b0d15] border border-[#E8E5EE] dark:border-slate-800 rounded-3xl overflow-hidden shadow-[0_10px_30px_rgba(30,20,60,0.04)] dark:shadow-none theme-transition">
          {isLoading ? (
            <LoadingSpinner message="Retrieving attendance history..." />
          ) : history.length === 0 ? (
            <p className="text-xs text-[#8E8A9C] dark:text-slate-400 py-8 text-center italic">No check-in history found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8F7FA] dark:bg-slate-950/80 border-b border-[#E8E5EE] dark:border-slate-800 text-[#686476] dark:text-slate-400 font-bold uppercase text-[11px] tracking-wider theme-transition">
                  <tr>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Check-in Time</th>
                    <th className="px-6 py-4">Check-out Time</th>
                    <th className="px-6 py-4">Method</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E5EE] dark:divide-slate-800/80">
                  {history.map((rec) => (
                    <tr key={rec._id} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/60 transition-colors">
                      <td className="px-6 py-4 font-bold text-[#15131D] dark:text-white tabular-nums">{rec.date}</td>
                      <td className="px-6 py-4 font-mono tabular-nums text-purple-600 dark:text-purple-400 font-bold">{rec.checkInTime}</td>
                      <td className="px-6 py-4 font-mono tabular-nums text-[#8E8A9C] dark:text-slate-400">{rec.checkOutTime || '—'}</td>
                      <td className="px-6 py-4 uppercase text-[10px] font-bold text-[#686476] dark:text-slate-300">
                        {rec.verificationMethod}
                      </td>
                      <td className="px-6 py-4">
                        <Badge status={rec.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
