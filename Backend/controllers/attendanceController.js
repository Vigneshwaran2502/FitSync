const crypto = require('crypto');
const Attendance = require('../models/Attendance');
const AttendanceQRSession = require('../models/AttendanceQRSession');
const Subscription = require('../models/Subscription');
const TrainerProfile = require('../models/TrainerProfile');
const WorkoutPlan = require('../models/WorkoutPlan');

// Haversine distance formula in meters
function getDistanceFromLatLonInM(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Radius of the earth in m
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; 
  return Math.round(d);
}

function deg2rad(deg) {
  return deg * (Math.PI/180);
}

// Helper to get today's local date (midnight)
function getTodayMidnight() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

// @desc    Generate a new QR session
// @route   POST /api/attendance/qr/generate
// @access  Private/Admin
const generateQRSession = async (req, res) => {
  try {
    const sessionId = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 1000); // 60 seconds

    const session = await AttendanceQRSession.create({
      sessionId,
      expiresAt,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      data: {
        sessionId: session.sessionId,
        expiresAt: session.expiresAt
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Check in using QR and location
// @route   POST /api/attendance/check-in
// @access  Private/Member
const checkIn = async (req, res) => {
  try {
    const { sessionId, latitude, longitude } = req.body;

    if (!sessionId || latitude == null || longitude == null) {
      return res.status(400).json({ success: false, message: 'sessionId, latitude, and longitude are required' });
    }

    const session = await AttendanceQRSession.findOne({ sessionId });
    if (!session || !session.isActive) {
      return res.status(400).json({ success: false, message: 'Invalid attendance QR session' });
    }
    if (new Date() > session.expiresAt) {
      return res.status(400).json({ success: false, message: 'QR code has expired' });
    }

    const activeSub = await Subscription.findOne({
      member: req.user.id,
      status: 'active',
      currentEndDate: { $gte: new Date() }
    });
    if (!activeSub) {
      return res.status(403).json({ success: false, message: 'Active membership is required to mark attendance' });
    }

    const gymLat = parseFloat(process.env.GYM_LATITUDE);
    const gymLon = parseFloat(process.env.GYM_LONGITUDE);
    const gymRadius = parseFloat(process.env.GYM_ATTENDANCE_RADIUS);
    
    const distance = getDistanceFromLatLonInM(gymLat, gymLon, latitude, longitude);

    if (distance > gymRadius) {
      return res.status(403).json({
        success: false,
        message: 'You are outside the permitted gym location',
        distanceFromGym: distance
      });
    }

    const attendanceDate = getTodayMidnight();
    const existing = await Attendance.findOne({ memberId: req.user.id, attendanceDate });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Attendance has already been marked for today' });
    }

    const attendance = await Attendance.create({
      memberId: req.user.id,
      attendanceDate,
      checkInTime: new Date(),
      status: 'present',
      verificationMethod: 'qr_location',
      latitude,
      longitude,
      distanceFromGym: distance,
      qrSessionId: sessionId
    });

    res.status(201).json({
      success: true,
      message: 'Attendance marked successfully',
      data: attendance
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'Attendance has already been marked for today' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Check out
// @route   POST /api/attendance/check-out
// @access  Private/Member
const checkOut = async (req, res) => {
  try {
    const attendanceDate = getTodayMidnight();
    const attendance = await Attendance.findOne({ memberId: req.user.id, attendanceDate, status: 'present' });

    if (!attendance) {
      return res.status(404).json({ success: false, message: 'No active attendance found for today' });
    }
    if (attendance.checkOutTime) {
      return res.status(400).json({ success: false, message: 'Already checked out' });
    }

    attendance.checkOutTime = new Date();
    await attendance.save();

    res.status(200).json({
      success: true,
      message: 'Check-out recorded successfully',
      data: attendance
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get my attendance history
// @route   GET /api/attendance/my
// @access  Private/Member
const getMyAttendance = async (req, res) => {
  try {
    const filter = { memberId: req.user.id };
    if (req.query.month && req.query.year) {
      const startDate = new Date(req.query.year, req.query.month - 1, 1);
      const endDate = new Date(req.query.year, req.query.month, 0, 23, 59, 59, 999);
      filter.attendanceDate = { $gte: startDate, $lte: endDate };
    }

    const records = await Attendance.find(filter).sort({ attendanceDate: -1 });
    res.status(200).json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get my attendance summary
// @route   GET /api/attendance/my/summary
// @access  Private/Member
const getMyAttendanceSummary = async (req, res) => {
  try {
    const totalPresent = await Attendance.countDocuments({ memberId: req.user.id, status: 'present' });
    
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    
    const currentMonthCount = await Attendance.countDocuments({
      memberId: req.user.id,
      status: 'present',
      attendanceDate: { $gte: startOfMonth, $lte: endOfMonth }
    });

    const lastRecord = await Attendance.findOne({ memberId: req.user.id, status: 'present' }).sort({ attendanceDate: -1 });
    
    // Average attendance calculation based on total days since first attendance could be complex, keeping it simple
    // Just providing basic stats as requested

    res.status(200).json({
      success: true,
      data: {
        totalPresent,
        currentMonth: currentMonthCount,
        lastAttendance: lastRecord ? lastRecord.attendanceDate : null
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin view all attendance
// @route   GET /api/attendance
// @access  Private/Admin
const getAllAttendance = async (req, res) => {
  try {
    const filter = {};
    if (req.query.date) filter.attendanceDate = new Date(req.query.date);
    if (req.query.memberId) filter.memberId = req.query.memberId;
    if (req.query.status) filter.status = req.query.status;

    const records = await Attendance.find(filter)
      .populate('memberId', 'name email phone')
      .sort({ attendanceDate: -1 });
    res.status(200).json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Trainer view associated members' attendance
// @route   GET /api/attendance/trainer/members
// @access  Private/Trainer
const getTrainerMembersAttendance = async (req, res) => {
  try {
    const profile = await TrainerProfile.findOne({ userId: req.user.id });
    if (!profile) return res.status(403).json({ success: false, message: 'Trainer profile not found' });

    // Members associated via WorkoutPlan
    const plans = await WorkoutPlan.find({ trainerId: profile._id }).select('memberId');
    const memberIds = plans.map(p => p.memberId);

    if (memberIds.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    const records = await Attendance.find({ memberId: { $in: memberIds } })
      .populate('memberId', 'name email phone')
      .sort({ attendanceDate: -1 });
      
    res.status(200).json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Manual attendance (Admin fallback)
// @route   POST /api/attendance/manual
// @access  Private/Admin
const manualAttendance = async (req, res) => {
  try {
    const { memberId, attendanceDate, notes } = req.body;
    if (!memberId || !attendanceDate) {
      return res.status(400).json({ success: false, message: 'memberId and attendanceDate are required' });
    }

    const aDate = new Date(attendanceDate);
    aDate.setHours(0,0,0,0);

    const existing = await Attendance.findOne({ memberId, attendanceDate: aDate });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Attendance has already been marked for this day' });
    }

    const attendance = await Attendance.create({
      memberId,
      attendanceDate: aDate,
      checkInTime: new Date(),
      status: 'present',
      verificationMethod: 'admin',
      notes
    });

    res.status(201).json({ success: true, message: 'Manual attendance recorded', data: attendance });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'Attendance has already been marked for this day' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  generateQRSession,
  checkIn,
  checkOut,
  getMyAttendance,
  getMyAttendanceSummary,
  getAllAttendance,
  getTrainerMembersAttendance,
  manualAttendance
};
