import { User } from "../models/User.js";
import { Subscription } from "../models/Subscription.js";
import { Attendance } from "../models/Attendance.js";
import { WorkoutPlan } from "../models/WorkoutPlan.js";
import { WorkoutLog } from "../models/WorkoutLog.js";
import { Appointment } from "../models/Appointment.js";
import { MembershipPlan } from "../models/MembershipPlan.js";
import { FitnessProfile } from "../models/FitnessProfile.js";
async function getAdminDashboardStats(req, res) {
  try {
    const todayStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const now = /* @__PURE__ */ new Date();
    const threeDaysAhead = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1e3);
    const [
      totalMembers,
      activeMembers,
      totalTrainers,
      activeSubscriptions,
      allSubscriptions,
      todayAttendanceRecords,
      expiringSubscriptions,
      activeWorkoutPlans,
      recentUsers,
      recentAttendance
    ] = await Promise.all([
      User.countDocuments({ role: "member" }),
      User.countDocuments({ role: "member", status: "active" }),
      User.countDocuments({ role: "trainer", status: "active" }),
      Subscription.countDocuments({ status: "active" }),
      Subscription.find().populate("planId", "name tier price"),
      Attendance.find({ date: todayStr }),
      Subscription.countDocuments({
        status: "active",
        endDate: { $gte: now, $lte: threeDaysAhead }
      }),
      WorkoutPlan.countDocuments({ status: "active" }),
      User.find({ role: "member" }).sort({ createdAt: -1 }).limit(6).select("name email createdAt"),
      Attendance.find().populate("userId", "name email").sort({ date: -1, checkInTime: -1 }).limit(6)
    ]);
    const assignedProfilesCount = await FitnessProfile.countDocuments({
      assignedTrainerId: { $exists: true, $ne: null }
    });
    const unassignedMembersCount = Math.max(0, totalMembers - assignedProfilesCount);
    const recentMemberIds = recentUsers.map((u) => u._id);
    const recentProfiles = await FitnessProfile.find({
      userId: { $in: recentMemberIds }
    }).populate("assignedTrainerId", "name email");
    const rpMap = /* @__PURE__ */ new Map();
    recentProfiles.forEach((p) => rpMap.set(p.userId.toString(), p));
    const enrichedRecentMembers = recentUsers.map((u) => ({
      ...u.toObject(),
      fitnessProfile: rpMap.get(u._id.toString()) || null
    }));
    const monthlyRevenue = allSubscriptions.filter((s) => s.status === "active").reduce((sum, s) => sum + (s.paymentAmount || 0), 0);
    const planCounts = {};
    allSubscriptions.forEach((sub) => {
      const planName = sub.planId?.name || "Standard";
      planCounts[planName] = (planCounts[planName] || 0) + 1;
    });
    const tierDistribution = Object.entries(planCounts).map(([name, value]) => ({
      name,
      value
    }));
    const attendanceTrend = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1e3);
      const dStr = d.toISOString().split("T")[0];
      const dayLabel = d.toLocaleDateString("en-US", { weekday: "short" });
      const count = await Attendance.countDocuments({ date: dStr });
      attendanceTrend.push({ day: dayLabel, date: dStr, checkIns: count });
    }
    const months = ["May", "Jun", "Jul", "Aug", "Sep", "Oct"];
    const revenueTrend = months.map((month, idx) => ({
      month,
      revenue: Math.round(monthlyRevenue * (0.75 + idx * 0.05)),
      members: Math.max(10, totalMembers - (5 - idx) * 3)
    }));
    res.json({
      cards: {
        totalMembers,
        activeMembers,
        totalTrainers,
        activeSubscriptions,
        monthlyRevenue,
        todayAttendance: todayAttendanceRecords.length,
        todayPresent: todayAttendanceRecords.filter((a) => a.status === "present").length,
        expiringSubscriptions,
        activeWorkoutPlans,
        assignedMembers: assignedProfilesCount,
        unassignedMembers: unassignedMembersCount
      },
      charts: {
        tierDistribution,
        attendanceTrend,
        revenueTrend
      },
      recentActivity: {
        recentMembers: enrichedRecentMembers,
        recentAttendance
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Error fetching admin dashboard statistics." });
  }
}
async function getTrainerDashboardStats(req, res) {
  try {
    if (!req.user) return res.status(401).json({ message: "Not authenticated." });
    const trainerId = req.user._id;
    const todayStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const [
      activePlans,
      todayAppointments,
      upcomingAppointments,
      assignedPlans,
      recentLogs
    ] = await Promise.all([
      WorkoutPlan.countDocuments({ trainerId, status: "active" }),
      Appointment.find({ trainerId, date: todayStr }).populate("memberId", "name email phone").sort({ startTime: 1 }),
      Appointment.find({
        trainerId,
        date: { $gte: todayStr },
        status: { $in: ["pending", "confirmed"] }
      }).populate("memberId", "name email phone").sort({ date: 1, startTime: 1 }).limit(5),
      WorkoutPlan.find({ trainerId }).populate("memberId", "name email").distinct("memberId"),
      WorkoutLog.find().populate("exerciseId", "name muscleGroup").populate("memberId", "name email").sort({ date: -1, createdAt: -1 }).limit(6)
    ]);
    const assignedMembersCount = assignedPlans.length;
    res.json({
      cards: {
        assignedMembersCount,
        activeWorkoutPlans: activePlans,
        todayAppointmentsCount: todayAppointments.length,
        upcomingAppointmentsCount: upcomingAppointments.length
      },
      todayAppointments,
      upcomingAppointments,
      recentLogs
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Error fetching trainer dashboard statistics." });
  }
}
async function getAdminReports(req, res) {
  try {
    const { reportType = "membership" } = req.query;
    const [members, subscriptions, attendance, plans, logs] = await Promise.all([
      User.find({ role: "member" }).select("name email phone status createdAt"),
      Subscription.find().populate("userId", "name email").populate("planId", "name price durationMonths"),
      Attendance.find().populate("userId", "name email").sort({ date: -1 }).limit(100),
      MembershipPlan.find(),
      WorkoutLog.find().populate("exerciseId", "name muscleGroup").populate("memberId", "name")
    ]);
    res.json({
      membersCount: members.length,
      subscriptionsCount: subscriptions.length,
      attendanceCount: attendance.length,
      plans,
      recentSubscriptions: subscriptions.slice(0, 20),
      recentAttendance: attendance.slice(0, 25),
      membersList: members
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Error generating reports." });
  }
}
export {
  getAdminDashboardStats,
  getAdminReports,
  getTrainerDashboardStats
};
