const User = require('../models/User');
const Subscription = require('../models/Subscription');
const TrainerProfile = require('../models/TrainerProfile');
const Appointment = require('../models/Appointment');
const Attendance = require('../models/Attendance');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    const totalMembers = await User.countDocuments({ role: 'member' });
    const totalTrainers = await User.countDocuments({ role: 'trainer' });
    
    const activeSubscriptions = await Subscription.countDocuments({ status: 'active' });
    const frozenSubscriptions = await Subscription.countDocuments({ status: 'frozen' });
    
    // Expiring within 7 days
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const expiringSubscriptions = await Subscription.countDocuments({ 
      status: 'active', 
      currentEndDate: { $lte: nextWeek, $gte: new Date() } 
    });

    const todayStart = new Date();
    todayStart.setHours(0,0,0,0);
    const todayEnd = new Date();
    todayEnd.setHours(23,59,59,999);

    const todaysAppointments = await Appointment.countDocuments({
      appointmentDate: { $gte: todayStart, $lte: todayEnd }
    });

    const todaysAttendance = await Attendance.countDocuments({
      attendanceDate: todayStart,
      status: 'present'
    });

    // Approximate revenue from active subs
    const subscriptions = await Subscription.find({ status: 'active' }).populate('membershipPlanId');
    let totalRevenue = 0;
    subscriptions.forEach(sub => {
      if (sub.membershipPlanId && sub.membershipPlanId.price) {
        totalRevenue += sub.membershipPlanId.price;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        totalMembers,
        totalTrainers,
        activeSubscriptions,
        expiringSubscriptions,
        frozenSubscriptions,
        todaysAppointments,
        todaysAttendance,
        totalRevenue
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all members
// @route   GET /api/admin/members
// @access  Private/Admin
const getMembers = async (req, res) => {
  try {
    const members = await User.find({ role: 'member' }).select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: members });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getMembers
};
