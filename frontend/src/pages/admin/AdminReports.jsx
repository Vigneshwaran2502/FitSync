import { useState, useEffect } from "react";
import { Download } from "lucide-react";
import { reportApi } from "../../api/reportApi";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { Badge } from "../../components/common/Badge";
const AdminReports = () => {
  const [reportData, setReportData] = useState(null);
  const [reportType, setReportType] = useState("memberships");
  const [isLoading, setIsLoading] = useState(true);
  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const res = await reportApi.getAdminReports(reportType);
      setReportData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchReports();
  }, [reportType]);
  const handleExportCSV = () => {
    if (!reportData) return;
    let headers = [];
    let rows = [];
    if (reportType === "memberships") {
      headers = ["Member Name", "Member Email", "Plan Name", "Amount ($)", "Status", "Start Date", "End Date"];
      rows = reportData.recentSubscriptions.map((s) => [
        `"${s.userId?.name || ""}"`,
        `"${s.userId?.email || ""}"`,
        `"${s.planId?.name || ""}"`,
        s.paymentAmount || "0",
        s.status,
        new Date(s.startDate).toISOString().split("T")[0],
        new Date(s.endDate).toISOString().split("T")[0]
      ]);
    } else if (reportType === "attendance") {
      headers = ["Member Name", "Email", "Date", "Check-In", "Check-Out", "Method", "Status"];
      rows = reportData.recentAttendance.map((a) => [
        `"${a.userId?.name || ""}"`,
        `"${a.userId?.email || ""}"`,
        a.date,
        a.checkInTime,
        a.checkOutTime || "",
        a.verificationMethod,
        a.status
      ]);
    } else {
      headers = ["Full Name", "Email", "Phone", "Status", "Registration Date"];
      rows = reportData.membersList.map((m) => [
        `"${m.name}"`,
        `"${m.email}"`,
        `"${m.phone || ""}"`,
        m.status,
        new Date(m.createdAt).toISOString().split("T")[0]
      ]);
    }
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `fitsync_report_${reportType}_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  return <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#15131D] dark:text-white tracking-tight">
            Facility Analytics & Reports
          </h1>
          <p className="text-xs sm:text-sm text-[#686476] dark:text-slate-400 mt-1">
            Audit commercial metrics, operational check-ins, and membership volume
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <select
    value={reportType}
    onChange={(e) => setReportType(e.target.value)}
    className="px-3.5 py-2 text-xs font-bold border border-slate-200 dark:border-white/10 rounded-xl bg-white dark:bg-[#0b0d14] text-[#15131D] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 dark:focus:border-purple-400 transition-colors shadow-xs"
  >
            <option value="memberships" className="dark:bg-[#0b0d14]">Subscriptions & Revenue</option>
            <option value="attendance" className="dark:bg-[#0b0d14]">Attendance Operations</option>
            <option value="directory" className="dark:bg-[#0b0d14]">Member Growth Roster</option>
          </select>

          <button
    onClick={handleExportCSV}
    className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl shadow-md shadow-purple-600/25 transition-all cursor-pointer"
  >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {isLoading ? <LoadingSpinner message="Synthesizing export datasets..." /> : !reportData ? <p className="text-xs text-[#686476] dark:text-slate-400">Failed to generate report.</p> : <div className="space-y-6">
          {
    /* Quick Metrics Header */
  }
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-[#0b0d14] border border-slate-200/80 dark:border-white/10 rounded-3xl p-5 shadow-xs theme-transition">
              <span className="text-[11px] font-bold text-[#686476] dark:text-slate-400 uppercase tracking-wider">
                Total Members
              </span>
              <p className="text-2xl font-black text-[#15131D] dark:text-white mt-1 tabular-nums">
                {reportData.membersCount}
              </p>
            </div>
            <div className="bg-white dark:bg-[#0b0d14] border border-slate-200/80 dark:border-white/10 rounded-3xl p-5 shadow-xs theme-transition">
              <span className="text-[11px] font-bold text-[#686476] dark:text-slate-400 uppercase tracking-wider">
                Active Subscriptions
              </span>
              <p className="text-2xl font-black text-[#15131D] dark:text-white mt-1 tabular-nums">
                {reportData.subscriptionsCount}
              </p>
            </div>
            <div className="bg-white dark:bg-[#0b0d14] border border-slate-200/80 dark:border-white/10 rounded-3xl p-5 shadow-xs theme-transition">
              <span className="text-[11px] font-bold text-[#686476] dark:text-slate-400 uppercase tracking-wider">
                Historical Check-ins
              </span>
              <p className="text-2xl font-black text-[#15131D] dark:text-white mt-1 tabular-nums">
                {reportData.attendanceCount}
              </p>
            </div>
          </div>

          {
    /* Report Data Preview Table */
  }
          <div className="bg-white dark:bg-[#0b0d14] border border-slate-200/80 dark:border-white/10 rounded-3xl overflow-hidden shadow-xs theme-transition">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#15131D] dark:text-white">
                {reportType === "memberships" ? "Revenue & Subscription Transactions" : reportType === "attendance" ? "Recent Check-in Verification Stream" : "Enrolled Member Census"}
              </h2>
              <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider bg-purple-50 dark:bg-purple-950/50 px-2.5 py-1 rounded-full border border-purple-200/60 dark:border-purple-800/60">
                Live Extract
              </span>
            </div>

            <div className="overflow-x-auto">
              {reportType === "memberships" && <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/70 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-[#686476] dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-6 py-3.5">Member</th>
                      <th className="px-6 py-3.5">Plan</th>
                      <th className="px-6 py-3.5">Billing Amount</th>
                      <th className="px-6 py-3.5">Valid From</th>
                      <th className="px-6 py-3.5">Valid To</th>
                      <th className="px-6 py-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {reportData.recentSubscriptions.map((s) => <tr key={s._id} className="hover:bg-purple-50/20 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-3.5 font-bold text-[#15131D] dark:text-white">{s.userId?.name}</td>
                        <td className="px-6 py-3.5 text-[#686476] dark:text-slate-300">{s.planId?.name}</td>
                        <td className="px-6 py-3.5 font-mono font-black tabular-nums text-purple-600 dark:text-purple-400">
                          ${s.paymentAmount}
                        </td>
                        <td className="px-6 py-3.5 text-[#686476] dark:text-slate-400 tabular-nums">
                          {new Date(s.startDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-3.5 text-[#686476] dark:text-slate-400 tabular-nums">
                          {new Date(s.endDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-3.5">
                          <Badge status={s.status} />
                        </td>
                      </tr>)}
                  </tbody>
                </table>}

              {reportType === "attendance" && <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/70 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-[#686476] dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-6 py-3.5">Member</th>
                      <th className="px-6 py-3.5">Date</th>
                      <th className="px-6 py-3.5">Check-in</th>
                      <th className="px-6 py-3.5">Check-out</th>
                      <th className="px-6 py-3.5">Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {reportData.recentAttendance.map((a) => <tr key={a._id} className="hover:bg-purple-50/20 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-3.5 font-bold text-[#15131D] dark:text-white">{a.userId?.name}</td>
                        <td className="px-6 py-3.5 text-[#686476] dark:text-slate-400 tabular-nums">{a.date}</td>
                        <td className="px-6 py-3.5 font-mono font-bold text-[#15131D] dark:text-white tabular-nums">{a.checkInTime}</td>
                        <td className="px-6 py-3.5 font-mono text-slate-400 dark:text-slate-500 tabular-nums">{a.checkOutTime || "\u2014"}</td>
                        <td className="px-6 py-3.5 uppercase text-[10px] font-bold text-purple-700 dark:text-purple-300">
                          {a.verificationMethod}
                        </td>
                      </tr>)}
                  </tbody>
                </table>}

              {reportType === "directory" && <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/70 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-[#686476] dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-6 py-3.5">Name</th>
                      <th className="px-6 py-3.5">Email</th>
                      <th className="px-6 py-3.5">Phone</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {reportData.membersList.map((m) => <tr key={m._id} className="hover:bg-purple-50/20 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-3.5 font-bold text-[#15131D] dark:text-white">{m.name}</td>
                        <td className="px-6 py-3.5 text-[#686476] dark:text-slate-300">{m.email}</td>
                        <td className="px-6 py-3.5 text-[#686476] dark:text-slate-400 tabular-nums font-mono">{m.phone || "\u2014"}</td>
                        <td className="px-6 py-3.5">
                          <Badge status={m.status} />
                        </td>
                        <td className="px-6 py-3.5 text-slate-400 dark:text-slate-500 tabular-nums">
                          {new Date(m.createdAt).toLocaleDateString()}
                        </td>
                      </tr>)}
                  </tbody>
                </table>}
            </div>
          </div>
        </div>}
    </div>;
};
export {
  AdminReports
};
