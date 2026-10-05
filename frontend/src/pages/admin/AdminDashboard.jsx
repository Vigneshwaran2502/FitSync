import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  UserCheck,
  CreditCard,
  DollarSign,
  QrCode,
  AlertTriangle,
  Dumbbell,
  Send,
  Plus,
  ArrowRight,
  TrendingUp
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip
} from "recharts";
import { reportApi } from "../../api/reportApi";
import { userApi } from "../../api/userApi";
import { membershipApi } from "../../api/membershipApi";
import { notificationApi } from "../../api/notificationApi";
import { StatCard } from "../../components/common/StatCard";
import { Modal } from "../../components/common/Modal";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { THEME_COLORS } from "../../styles/themeTokens";
const COLORS = THEME_COLORS.chartPalette;
const AdminDashboard = () => {
  const [stats, setStats] = useState({
    cards: {
      totalMembers: 12,
      activeMembers: 10,
      totalTrainers: 4,
      activeSubscriptions: 8,
      monthlyRevenue: 2840,
      todayAttendance: 5,
      todayPresent: 3,
      expiringSubscriptions: 1,
      activeWorkoutPlans: 6
    },
    charts: {
      tierDistribution: [
        { name: "Elite All-Access", value: 5 },
        { name: "Strength Pro", value: 3 }
      ],
      attendanceTrend: [
        { day: "Mon", date: "2026-09-25", checkIns: 4 },
        { day: "Tue", date: "2026-09-26", checkIns: 7 },
        { day: "Wed", date: "2026-09-27", checkIns: 6 },
        { day: "Thu", date: "2026-09-28", checkIns: 9 },
        { day: "Fri", date: "2026-09-29", checkIns: 8 },
        { day: "Sat", date: "2026-09-30", checkIns: 11 },
        { day: "Sun", date: "2026-10-01", checkIns: 5 }
      ],
      revenueTrend: [
        { month: "May", revenue: 2100, members: 8 },
        { month: "Jun", revenue: 2350, members: 9 },
        { month: "Jul", revenue: 2500, members: 10 },
        { month: "Aug", revenue: 2680, members: 11 },
        { month: "Sep", revenue: 2800, members: 12 },
        { month: "Oct", revenue: 2840, members: 12 }
      ]
    },
    recentActivity: {
      recentMembers: [],
      recentAttendance: []
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserRole, setNewUserRole] = useState("member");
  const [newUserData, setNewUserData] = useState({ name: "", email: "", password: "", phone: "", specialization: "" });
  const [isAddPlanOpen, setIsAddPlanOpen] = useState(false);
  const [newPlanData, setNewPlanData] = useState({ name: "", description: "", durationMonths: 1, price: 49, tier: "standard" });
  const [isAnnouncementOpen, setIsAnnouncementOpen] = useState(false);
  const [announcementData, setAnnouncementData] = useState({ title: "", message: "", audience: "Everyone" });
  const [actionSuccess, setActionSuccess] = useState(null);
  const navigate = useNavigate();
  const fetchStats = async (retriesOrEvent) => {
    const retries = typeof retriesOrEvent === "number" ? retriesOrEvent : 2;
    try {
      const res = await reportApi.getAdminStats();
      if (res && res.cards) {
        setStats(res);
        setError(null);
      }
    } catch (err) {
      if (retries > 0) {
        setTimeout(() => fetchStats(retries - 1), 1200);
        return;
      }
      console.warn("Dashboard stats refresh warning:", err?.message);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchStats(2);
  }, []);
  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await userApi.createUser({
        ...newUserData,
        role: newUserRole,
        specialization: newUserData.specialization ? [newUserData.specialization] : void 0
      });
      setIsAddUserOpen(false);
      setNewUserData({ name: "", email: "", password: "", phone: "", specialization: "" });
      setActionSuccess(`New ${newUserRole} created successfully!`);
      setTimeout(() => setActionSuccess(null), 3e3);
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create user");
    }
  };
  const handleCreatePlan = async (e) => {
    e.preventDefault();
    try {
      await membershipApi.createPlan({
        ...newPlanData,
        features: ["Gym Floor Access", "Locker Room", "FitSync App Access"]
      });
      setIsAddPlanOpen(false);
      setNewPlanData({ name: "", description: "", durationMonths: 1, price: 49, tier: "standard" });
      setActionSuccess("Membership plan created successfully!");
      setTimeout(() => setActionSuccess(null), 3e3);
      fetchStats();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create plan");
    }
  };
  const handleSendAnnouncement = async (e) => {
    e.preventDefault();
    try {
      const res = await notificationApi.broadcastAnnouncement(announcementData);
      setIsAnnouncementOpen(false);
      setAnnouncementData({ title: "", message: "", audience: "Everyone" });
      setActionSuccess(res.message);
      setTimeout(() => setActionSuccess(null), 4e3);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to broadcast announcement");
    }
  };
  if (isLoading && !stats) {
    return <LoadingSpinner message="Aggregating gym management telemetry..." />;
  }
  const cards = stats?.cards || {
    totalMembers: 0,
    activeMembers: 0,
    totalTrainers: 0,
    activeSubscriptions: 0,
    monthlyRevenue: 0,
    todayAttendance: 0,
    todayPresent: 0,
    expiringSubscriptions: 0,
    activeWorkoutPlans: 0
  };
  const charts = stats?.charts || {
    tierDistribution: [],
    attendanceTrend: [],
    revenueTrend: []
  };
  const recentActivity = stats?.recentActivity || {
    recentMembers: [],
    recentAttendance: []
  };
  return <div className="space-y-6">
      {
    /* Top Banner Alert on Action */
  }
      {actionSuccess && <div className="p-4 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 text-purple-900 dark:text-purple-300 rounded-2xl text-xs font-semibold flex items-center justify-between theme-transition">
          <span>{actionSuccess}</span>
          <button onClick={() => setActionSuccess(null)} className="text-purple-700 dark:text-purple-400 hover:opacity-75 font-bold cursor-pointer">✕</button>
        </div>}

      {
    /* Header and Quick Actions Bar */
  }
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#15131D] dark:text-white tracking-tight">Executive Dashboard</h1>
          <p className="text-xs text-[#686476] dark:text-slate-400 mt-1">Real-time facility management, revenue, and member engagement</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
    onClick={() => {
      setNewUserRole("member");
      setIsAddUserOpen(true);
    }}
    className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold text-[#15131D] dark:text-slate-200 bg-white dark:bg-slate-900 border border-[#E8E5EE] dark:border-slate-800 hover:border-purple-500/50 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl shadow-xs transition-all cursor-pointer"
  >
            <Plus className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>Add Member</span>
          </button>
          <button
    onClick={() => {
      setNewUserRole("trainer");
      setIsAddUserOpen(true);
    }}
    className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold text-[#15131D] dark:text-slate-200 bg-white dark:bg-slate-900 border border-[#E8E5EE] dark:border-slate-800 hover:border-purple-500/50 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl shadow-xs transition-all cursor-pointer"
  >
            <Plus className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>Add Trainer</span>
          </button>
          <button
    onClick={() => navigate("/admin/attendance/qr")}
    className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold text-[#15131D] dark:text-slate-200 bg-white dark:bg-slate-900 border border-[#E8E5EE] dark:border-slate-800 hover:border-purple-500/50 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl shadow-xs transition-all cursor-pointer"
  >
            <QrCode className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>QR Station</span>
          </button>
          <button
    onClick={() => setIsAnnouncementOpen(true)}
    className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl shadow-md shadow-purple-600/25 hover:shadow-purple-600/40 transition-all cursor-pointer"
  >
            <Send className="w-3.5 h-3.5" />
            <span>Broadcast</span>
          </button>
        </div>
      </div>

      {
    /* Primary KPI Grid (8 Cards) */
  }
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
    title="Total Members"
    value={cards.totalMembers}
    subtitle={`${cards.activeMembers} currently active`}
    icon={Users}
    onClick={() => navigate("/admin/members")}
  />
        <StatCard
    title="Active Trainers"
    value={cards.totalTrainers}
    subtitle="Certified staff on duty"
    icon={UserCheck}
    onClick={() => navigate("/admin/trainers")}
  />
        <StatCard
    title="Active Subscriptions"
    value={cards.activeSubscriptions}
    subtitle={`${cards.expiringSubscriptions} expiring this week`}
    icon={CreditCard}
    trend={{ value: `${cards.activeSubscriptions} active`, isPositive: true }}
    onClick={() => navigate("/admin/subscriptions")}
  />
        <StatCard
    title="Monthly Revenue"
    value={`$${(cards.monthlyRevenue || 0).toLocaleString()}`}
    subtitle="Recurring membership run-rate"
    icon={DollarSign}
    onClick={() => navigate("/admin/reports")}
  />
        <StatCard
    title="Today Check-ins"
    value={cards.todayAttendance}
    subtitle={`${cards.todayPresent} currently in facility`}
    icon={QrCode}
    onClick={() => navigate("/admin/attendance")}
  />
        <StatCard
    title="Expiring Subscriptions"
    value={cards.expiringSubscriptions}
    subtitle="Within next 3 days"
    icon={AlertTriangle}
    onClick={() => navigate("/admin/subscriptions")}
  />
        <StatCard
    title="Active Workout Plans"
    value={cards.activeWorkoutPlans}
    subtitle="Assigned across members"
    icon={Dumbbell}
    onClick={() => navigate("/admin/workouts")}
  />
        <StatCard
    title="Revenue Growth"
    value="+14.2%"
    subtitle="Compared to previous quarter"
    icon={TrendingUp}
    trend={{ value: "+14.2%", isPositive: true }}
    onClick={() => navigate("/admin/reports")}
  />
      </div>

      {
    /* Analytics Charts Grid */
  }
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {
    /* Attendance Trend Chart */
  }
        <div className="lg:col-span-2 bg-white dark:bg-[#0b0d15] border border-[#E8E5EE] dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-[0_10px_30px_rgba(30,20,60,0.04)] dark:shadow-none theme-transition">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-[#15131D] dark:text-white">7-Day Attendance Trend</h2>
              <p className="text-xs text-[#686476] dark:text-slate-400 mt-0.5">Daily check-in volume across QR & GPS verification</p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-lime-500 animate-pulse" />
              Live Facility Flow
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.attendanceTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
    contentStyle={{ backgroundColor: "#0b0d15", border: "1px solid #1e293b", borderRadius: "12px", color: "#fff", fontSize: "12px" }}
    cursor={{ fill: "rgba(124, 58, 237, 0.06)" }}
  />
                <Bar dataKey="checkIns" fill="#7C3AED" radius={[6, 6, 0, 0]} name="Check-ins" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {
    /* Membership Tier Distribution */
  }
        <div className="bg-white dark:bg-[#0b0d15] border border-[#E8E5EE] dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-[0_10px_30px_rgba(30,20,60,0.04)] dark:shadow-none flex flex-col theme-transition">
          <div className="mb-4">
            <h2 className="text-sm font-bold text-[#15131D] dark:text-white">Membership Distribution</h2>
            <p className="text-xs text-[#686476] dark:text-slate-400 mt-0.5">Active subscriptions by plan tier</p>
          </div>
          <div className="h-52 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
    data={charts.tierDistribution || []}
    cx="50%"
    cy="50%"
    innerRadius={50}
    outerRadius={75}
    paddingAngle={4}
    dataKey="value"
  >
                  {(charts.tierDistribution || []).map((_entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip
    contentStyle={{ backgroundColor: "#0b0d15", border: "1px solid #1e293b", borderRadius: "12px", color: "#fff", fontSize: "12px" }}
  />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 space-y-1 text-xs">
            {(charts.tierDistribution || []).map((tier, idx) => <div key={tier.name} className="flex items-center justify-between text-[#686476] dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="truncate max-w-[140px] font-medium">{tier.name}</span>
                </div>
                <span className="font-bold text-[#15131D] dark:text-white tabular-nums">{tier.value}</span>
              </div>)}
          </div>
        </div>
      </div>

      {
    /* Secondary Chart: 6-Month Revenue History */
  }
      <div className="bg-white dark:bg-[#0b0d15] border border-[#E8E5EE] dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-[0_10px_30px_rgba(30,20,60,0.04)] dark:shadow-none theme-transition">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-[#15131D] dark:text-white">Revenue Progression (USD)</h2>
            <p className="text-xs text-[#686476] dark:text-slate-400 mt-0.5">Monthly recurring income and member base expansion</p>
          </div>
          <button
    onClick={() => navigate("/admin/reports")}
    className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 flex items-center gap-1 cursor-pointer"
  >
            <span>Full Report</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={charts.revenueTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(val) => `$${val}`} />
              <Tooltip
    contentStyle={{ backgroundColor: "#0b0d15", border: "1px solid #1e293b", borderRadius: "12px", color: "#fff", fontSize: "12px" }}
  />
              <Area type="monotone" dataKey="revenue" stroke="#7C3AED" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" name="Revenue ($)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {
    /* Recent Activity: New Members & Live Attendance Tables */
  }
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {
    /* Recent Members */
  }
        <div className="bg-white dark:bg-[#0b0d15] border border-[#E8E5EE] dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-[0_10px_30px_rgba(30,20,60,0.04)] dark:shadow-none theme-transition">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-[#15131D] dark:text-white">Recently Enrolled Members</h2>
                {cards.unassignedMembers > 0 && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
                    {cards.unassignedMembers} Need Coach
                  </span>}
              </div>
              <p className="text-[11px] text-[#686476] dark:text-slate-400 mt-0.5">Trainer assignment telemetry</p>
            </div>
            <button
    onClick={() => navigate("/admin/members")}
    className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
  >
              View Directory &rarr;
            </button>
          </div>
          <div className="divide-y divide-[#E8E5EE] dark:divide-slate-800/80">
            {(recentActivity.recentMembers || []).length === 0 ? <p className="text-xs text-[#8E8A9C] dark:text-slate-400 py-4 text-center italic">No new members enrolled today</p> : (recentActivity.recentMembers || []).map((m) => {
    const assignedCoach = m.fitnessProfile?.assignedTrainerId;
    const isAssigned = Boolean(assignedCoach);
    return <div key={m._id} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-2xl bg-purple-100 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 flex items-center justify-center text-xs font-bold shrink-0">
                        {(m.name || "M").charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#15131D] dark:text-white truncate">{m.name || "Member"}</p>
                        <p className="text-[11px] text-[#686476] dark:text-slate-400 truncate">{m.email || "\u2014"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      {isAssigned ? <div className="flex items-center gap-1.5">
                          <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80 shadow-2xs"
      title={assignedCoach?.name ? `Assigned to Coach ${assignedCoach.name}` : "Coach Assigned"}
    >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                            <span>Assigned</span>
                          </span>
                          {assignedCoach?.name && <span className="text-[11px] font-bold text-[#686476] dark:text-slate-400 hidden sm:inline">
                              · Coach {assignedCoach.name.split(" ")[0]}
                            </span>}
                        </div> : <button
      onClick={() => navigate("/admin/members")}
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/80 transition-colors cursor-pointer shadow-2xs"
      title="Click to assign a coach in Member Directory"
    >
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
                          <span>Unassigned</span>
                        </button>}
                    </div>
                  </div>;
  })}
          </div>
        </div>

        {
    /* Live Attendance Activity */
  }
        <div className="bg-white dark:bg-[#0b0d15] border border-[#E8E5EE] dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-[0_10px_30px_rgba(30,20,60,0.04)] dark:shadow-none theme-transition">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-[#15131D] dark:text-white">Recent Attendance Records</h2>
            <button
    onClick={() => navigate("/admin/attendance")}
    className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
  >
              All Records &rarr;
            </button>
          </div>
          <div className="divide-y divide-[#E8E5EE] dark:divide-slate-800/80">
            {(recentActivity.recentAttendance || []).length === 0 ? <p className="text-xs text-[#8E8A9C] dark:text-slate-400 py-4 text-center italic">No live check-in activity recorded today</p> : (recentActivity.recentAttendance || []).map((a) => <div key={a._id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-[#15131D] dark:text-white">{a.userId?.name || "Member"}</p>
                    <p className="text-[11px] text-[#686476] dark:text-slate-400">
                      {a.date} · In: <span className="tabular-nums font-mono text-purple-600 dark:text-purple-400 font-bold">{a.checkInTime}</span>
                      {a.checkOutTime && ` \xB7 Out: ${a.checkOutTime}`}
                    </p>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                    {a.verificationMethod || "QR"}
                  </span>
                </div>)}
          </div>
        </div>
      </div>

      {
    /* Modal: Add User (Member or Trainer) */
  }
      <Modal
    isOpen={isAddUserOpen}
    onClose={() => setIsAddUserOpen(false)}
    title={`Register New ${newUserRole === "trainer" ? "Trainer" : "Member"}`}
    subtitle="Create an authorized account in the FitSync platform"
  >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
            <input
    type="text"
    required
    value={newUserData.name}
    onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-600"
    placeholder="e.g. Jordan Lee"
  />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <input
    type="email"
    required
    value={newUserData.email}
    onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-600"
    placeholder="jordan@domain.com"
  />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Temporary Password</label>
            <input
    type="password"
    required
    value={newUserData.password}
    onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-600"
    placeholder="Min 6 characters"
  />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
            <input
    type="tel"
    value={newUserData.phone}
    onChange={(e) => setNewUserData({ ...newUserData, phone: e.target.value })}
    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-600"
    placeholder="+1 (555) 000-0000"
  />
          </div>
          {newUserRole === "trainer" && <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Specialization</label>
              <input
    type="text"
    value={newUserData.specialization}
    onChange={(e) => setNewUserData({ ...newUserData, specialization: e.target.value })}
    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-600"
    placeholder="e.g. Strength & Conditioning, HIIT"
  />
            </div>}
          <div className="flex justify-end gap-2.5 pt-3">
            <button
    type="button"
    onClick={() => setIsAddUserOpen(false)}
    className="px-4 py-2 text-xs font-bold text-[#686476] dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl cursor-pointer"
  >
              Cancel
            </button>
            <button
    type="submit"
    className="px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl shadow-md shadow-purple-600/25 cursor-pointer"
  >
              Create Account
            </button>
          </div>
        </form>
      </Modal>

      {
    /* Modal: Broadcast Announcement */
  }
      <Modal
    isOpen={isAnnouncementOpen}
    onClose={() => setIsAnnouncementOpen(false)}
    title="Broadcast Announcement"
    subtitle="Send an immediate system alert to gym members and staff"
  >
        <form onSubmit={handleSendAnnouncement} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#15131D] dark:text-white mb-1.5">Target Audience</label>
            <select
    value={announcementData.audience}
    onChange={(e) => setAnnouncementData({ ...announcementData, audience: e.target.value })}
    className="w-full px-3 py-2 text-xs border border-[#E8E5EE] dark:border-slate-800 bg-[#F8F7FA] dark:bg-slate-900 text-[#15131D] dark:text-white rounded-xl focus:outline-hidden focus:border-purple-600"
  >
              <option value="Everyone">Everyone (All Members & Trainers)</option>
              <option value="Members">Members Only</option>
              <option value="Trainers">Trainers Only</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-[#15131D] dark:text-white mb-1.5">Announcement Title</label>
            <input
    type="text"
    required
    value={announcementData.title}
    onChange={(e) => setAnnouncementData({ ...announcementData, title: e.target.value })}
    className="w-full px-3 py-2 text-xs border border-[#E8E5EE] dark:border-slate-800 bg-[#F8F7FA] dark:bg-slate-900 text-[#15131D] dark:text-white rounded-xl focus:outline-hidden focus:border-purple-600"
    placeholder="e.g. Holiday Schedule & Free Sauna Weekend"
  />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#15131D] dark:text-white mb-1.5">Message Content</label>
            <textarea
    required
    rows={4}
    value={announcementData.message}
    onChange={(e) => setAnnouncementData({ ...announcementData, message: e.target.value })}
    className="w-full px-3 py-2 text-xs border border-[#E8E5EE] dark:border-slate-800 bg-[#F8F7FA] dark:bg-slate-900 text-[#15131D] dark:text-white rounded-xl focus:outline-hidden focus:border-purple-600"
    placeholder="Enter announcement notice details..."
  />
          </div>
          <div className="flex justify-end gap-2.5 pt-3">
            <button
    type="button"
    onClick={() => setIsAnnouncementOpen(false)}
    className="px-4 py-2 text-xs font-bold text-[#686476] dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl cursor-pointer"
  >
              Cancel
            </button>
            <button
    type="submit"
    className="px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl shadow-md shadow-purple-600/25 cursor-pointer"
  >
              Broadcast Notice
            </button>
          </div>
        </form>
      </Modal>
    </div>;
};
export {
  AdminDashboard
};
