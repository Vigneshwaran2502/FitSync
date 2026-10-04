import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, Plus, LogOut, CheckCircle2, User, Search, MapPin } from 'lucide-react';
import { attendanceApi } from '../../api/attendanceApi';
import { userApi } from '../../api/userApi';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';

export const AdminAttendance: React.FC = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [todaySummary, setTodaySummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('');

  // Manual Check-in Modal
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [selectedMember, setSelectedMember] = useState('');

  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [histRes, todayRes] = await Promise.all([
        attendanceApi.getHistory({ startDate: dateFilter || undefined }),
        attendanceApi.getTodayPresent(),
      ]);
      setRecords(histRes.records || []);
      setTodaySummary(todayRes);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateFilter]);

  const handleOpenManual = async () => {
    setIsManualOpen(true);
    try {
      const res = await userApi.getUsers({ role: 'member', limit: 100 });
      setMembers(res.users || []);
      if (res.users?.length > 0) setSelectedMember(res.users[0]._id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleManualCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;

    try {
      await attendanceApi.checkIn({
        verificationMethod: 'manual',
        memberId: selectedMember,
      });
      setIsManualOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error checking in member');
    }
  };

  const handleCheckOut = async (memberId: string) => {
    try {
      await attendanceApi.checkOut(memberId);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error checking out');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#15131D] dark:text-white tracking-tight">Facility Attendance</h1>
          <p className="text-xs text-[#686476] dark:text-slate-400 mt-1">Track live gym occupancy, entry verifications, and member checkout</p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/admin/attendance/qr')}
            className="flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold text-[#15131D] dark:text-slate-200 bg-white dark:bg-slate-900 border border-[#E8E5EE] dark:border-slate-800 hover:border-purple-500/50 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>Launch QR Station</span>
          </button>
          <button
            onClick={handleOpenManual}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl shadow-md shadow-purple-600/25 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Manual Check-in</span>
          </button>
        </div>
      </div>

      {/* Occupancy Indicator Banner */}
      {todaySummary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white dark:bg-[#0b0d15] border border-[#E8E5EE] dark:border-slate-800 rounded-2xl p-5 shadow-[0_10px_30px_rgba(30,20,60,0.04)] dark:shadow-none theme-transition">
          <div>
            <span className="text-[11px] font-bold text-[#8E8A9C] dark:text-slate-400 uppercase tracking-wider">Date</span>
            <p className="text-sm font-bold text-[#15131D] dark:text-white mt-1 tabular-nums font-mono">{todaySummary.date}</p>
          </div>
          <div>
            <span className="text-[11px] font-bold text-[#8E8A9C] dark:text-slate-400 uppercase tracking-wider">Total Check-ins Today</span>
            <p className="text-2xl font-black text-[#15131D] dark:text-white mt-1 tabular-nums font-mono">{todaySummary.totalToday}</p>
          </div>
          <div>
            <span className="text-[11px] font-bold text-[#8E8A9C] dark:text-slate-400 uppercase tracking-wider">Currently On Floor</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2.5 h-2.5 rounded-full bg-lime-500 animate-pulse" />
              <span className="text-2xl font-black text-purple-600 dark:text-purple-400 tabular-nums font-mono">
                {todaySummary.currentlyPresent} Members
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600">Filter Date:</label>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-2.5 py-1 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-600 bg-white"
          />
          {dateFilter && (
            <button
              onClick={() => setDateFilter('')}
              className="text-xs text-slate-500 hover:text-slate-800 underline ml-2"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Attendance History Table */}
      <div className="bg-white dark:bg-[#0b0d15] border border-[#E8E5EE] dark:border-slate-800 rounded-3xl overflow-hidden shadow-[0_10px_30px_rgba(30,20,60,0.04)] dark:shadow-none theme-transition">
        {isLoading ? (
          <LoadingSpinner message="Loading attendance records..." />
        ) : records.length === 0 ? (
          <EmptyState
            title="No attendance records found"
            description="No check-ins have been recorded matching this filter date."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F7FA] dark:bg-slate-950/80 border-b border-[#E8E5EE] dark:border-slate-800 text-[#686476] dark:text-slate-400 font-bold uppercase text-[11px] tracking-wider theme-transition">
                <tr>
                  <th className="px-6 py-4">Member</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Check-in</th>
                  <th className="px-6 py-4">Check-out</th>
                  <th className="px-6 py-4">Method</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E5EE] dark:divide-slate-800/80">
                {records.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/60 transition-colors">
                    <td className="px-6 py-4 font-medium text-[#15131D] dark:text-white">
                      <div>
                        <p className="font-bold text-[#15131D] dark:text-white">{r.userId?.name || 'Unknown'}</p>
                        <p className="text-[11px] text-[#686476] dark:text-slate-400 font-normal">{r.userId?.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[#686476] dark:text-slate-300 tabular-nums font-mono">{r.date}</td>
                    <td className="px-6 py-4 font-mono text-purple-600 dark:text-purple-400 font-bold tabular-nums">{r.checkInTime}</td>
                    <td className="px-6 py-4 font-mono text-[#686476] dark:text-slate-400 tabular-nums">
                      {r.checkOutTime || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 px-2.5 py-0.5 rounded-full">
                        {r.verificationMethod}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge status={r.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      {r.status === 'present' ? (
                        <button
                          onClick={() => handleCheckOut(r.userId?._id)}
                          className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-xl border border-rose-200 dark:border-rose-900/60 transition-colors cursor-pointer"
                        >
                          <LogOut className="w-3 h-3" />
                          <span>Check Out</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400">Completed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Check-in Modal */}
      <Modal
        isOpen={isManualOpen}
        onClose={() => setIsManualOpen(false)}
        title="Manual Front Desk Check-in"
        subtitle="Log attendance for a member present at the facility"
      >
        <form onSubmit={handleManualCheckIn} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#15131D] dark:text-white mb-1.5">Select Member</label>
            <select
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs border border-[#E8E5EE] dark:border-slate-800 rounded-xl focus:outline-hidden focus:border-purple-600 bg-[#F8F7FA] dark:bg-slate-900 text-[#15131D] dark:text-white"
            >
              {members.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name} ({m.email})
                </option>
              ))}
            </select>
          </div>

          <p className="text-[11px] text-[#686476] dark:text-slate-400 leading-relaxed">
            This will record an authorized manual check-in for today. The member must have an active subscription unless authorized by management.
          </p>

          <div className="flex justify-end gap-2.5 pt-3">
            <button
              type="button"
              onClick={() => setIsManualOpen(false)}
              className="px-4 py-2 text-xs font-bold text-[#686476] dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl shadow-md shadow-purple-600/25 transition-all cursor-pointer"
            >
              Confirm Check-in
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
