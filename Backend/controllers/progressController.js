const FitnessProfile = require('../models/FitnessProfile');
const ProgressMeasurement = require('../models/ProgressMeasurement');
const FitnessGoal = require('../models/FitnessGoal');
const TrainerProfile = require('../models/TrainerProfile');
const WorkoutPlan = require('../models/WorkoutPlan');
const WorkoutLog = require('../models/WorkoutLog');
const Attendance = require('../models/Attendance');

// Helper for BMI
const calculateBMI = (weightKg, heightCm) => {
  if (!weightKg || !heightCm || heightCm <= 0) return null;
  const h = heightCm / 100;
  return Number((weightKg / (h * h)).toFixed(2));
};

// @desc    Create or update profile
// @route   POST /api/progress/profile and PUT /api/progress/profile
// @access  Private/Member
const createOrUpdateProfile = async (req, res) => {
  try {
    const profile = await FitnessProfile.findOneAndUpdate(
      { memberId: req.user.id },
      { ...req.body, memberId: req.user.id },
      { new: true, upsert: true, runValidators: true }
    );
    res.status(200).json({ success: true, message: 'Profile saved successfully', data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get profile
// @route   GET /api/progress/profile
// @access  Private/Member
const getProfile = async (req, res) => {
  try {
    const profile = await FitnessProfile.findOne({ memberId: req.user.id });
    if (!profile) return res.status(404).json({ success: false, message: 'Profile not found' });
    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add measurement
// @route   POST /api/progress/measurements
// @access  Private
const addMeasurement = async (req, res) => {
  try {
    let targetMemberId = req.user.id;
    if (req.body.memberId && req.user.role !== 'member') {
      targetMemberId = req.body.memberId;
    }

    if (req.user.role === 'trainer') {
      const profile = await TrainerProfile.findOne({ userId: req.user.id });
      if (!profile) return res.status(403).json({ success: false, message: 'Trainer profile not found' });
      const plan = await WorkoutPlan.findOne({ trainerId: profile._id, memberId: targetMemberId });
      if (!plan) return res.status(403).json({ success: false, message: 'Unauthorized member access' });
    }

    const { weightKg } = req.body;
    const measurement = await ProgressMeasurement.create({
      ...req.body,
      memberId: targetMemberId,
      recordedDate: req.body.recordedDate || new Date(),
      createdBy: req.user.id
    });

    if (weightKg) {
      await FitnessProfile.findOneAndUpdate({ memberId: targetMemberId }, { currentWeightKg: weightKg }, { upsert: true });
    }

    res.status(201).json({ success: true, message: 'Measurement added', data: measurement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get latest measurement
// @route   GET /api/progress/latest
// @access  Private/Member
const getLatestMeasurement = async (req, res) => {
  try {
    const measurement = await ProgressMeasurement.findOne({ memberId: req.user.id }).sort({ recordedDate: -1 });
    res.status(200).json({ success: true, data: measurement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get weight history
// @route   GET /api/progress/weight-history
// @access  Private/Member
const getWeightHistory = async (req, res) => {
  try {
    const history = await ProgressMeasurement.find({ memberId: req.user.id, weightKg: { $exists: true } })
      .sort({ recordedDate: 1 })
      .select('recordedDate weightKg');
    
    const formatted = history.map(h => ({
      date: h.recordedDate.toISOString().split('T')[0],
      weightKg: h.weightKg
    }));

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get measurement history
// @route   GET /api/progress/measurements
// @access  Private/Member
const getMeasurementHistory = async (req, res) => {
  try {
    const filter = { memberId: req.user.id };
    if (req.query.from && req.query.to) {
      filter.recordedDate = { $gte: new Date(req.query.from), $lte: new Date(req.query.to) };
    }
    const measurements = await ProgressMeasurement.find(filter).sort({ recordedDate: -1 });
    res.status(200).json({ success: true, data: measurements });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create goal
// @route   POST /api/progress/goals
// @access  Private/Member
const createGoal = async (req, res) => {
  try {
    const goal = await FitnessGoal.create({
      ...req.body,
      memberId: req.user.id,
      createdBy: req.user.id
    });
    res.status(201).json({ success: true, message: 'Goal created', data: goal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get own goals
// @route   GET /api/progress/goals
// @access  Private/Member
const getGoals = async (req, res) => {
  try {
    const goals = await FitnessGoal.find({ memberId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: goals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update goal
// @route   PUT /api/progress/goals/:id
// @access  Private/Member
const updateGoal = async (req, res) => {
  try {
    const goal = await FitnessGoal.findOne({ _id: req.params.id, memberId: req.user.id });
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });
    
    Object.assign(goal, req.body);
    if (goal.targetValue && goal.currentValue !== undefined) {
      if ((goal.startValue > goal.targetValue && goal.currentValue <= goal.targetValue) || 
          (goal.startValue < goal.targetValue && goal.currentValue >= goal.targetValue)) {
        goal.status = 'achieved';
      }
    }
    await goal.save();

    res.status(200).json({ success: true, message: 'Goal updated', data: goal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- Dashboard Aggregation ---
const buildDashboard = async (memberId) => {
  const profile = await FitnessProfile.findOne({ memberId });
  const bmi = profile ? calculateBMI(profile.currentWeightKg, profile.heightCm) : null;

  // Weight Progress
  const firstM = await ProgressMeasurement.findOne({ memberId, weightKg: { $exists: true } }).sort({ recordedDate: 1 });
  const latestM = await ProgressMeasurement.findOne({ memberId, weightKg: { $exists: true } }).sort({ recordedDate: -1 });
  
  let weightProgress = null;
  if (firstM && latestM) {
    weightProgress = {
      startingWeight: firstM.weightKg,
      currentWeight: latestM.weightKg,
      targetWeight: profile ? profile.targetWeightKg : null,
      change: Number((latestM.weightKg - firstM.weightKg).toFixed(2))
    };
  }

  // Attendance
  const totalPresent = await Attendance.countDocuments({ memberId, status: 'present' });
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  const currentMonth = await Attendance.countDocuments({ memberId, status: 'present', attendanceDate: { $gte: startOfMonth, $lte: endOfMonth } });

  // Workouts
  const totalPlans = await WorkoutPlan.countDocuments({ memberId });
  const completedWorkouts = await WorkoutLog.countDocuments({ memberId });

  // Goals
  const active = await FitnessGoal.countDocuments({ memberId, status: 'active' });
  const achieved = await FitnessGoal.countDocuments({ memberId, status: 'achieved' });

  return {
    profile: profile || {},
    bmi,
    weightProgress,
    attendance: { totalPresent, currentMonth },
    workouts: { totalPlans, completedWorkouts },
    goals: { active, achieved }
  };
};

// @desc    Get dashboard
// @route   GET /api/progress/dashboard
// @access  Private/Member
const getDashboard = async (req, res) => {
  try {
    const data = await buildDashboard(req.user.id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Trainer view member progress
// @route   GET /api/progress/member/:memberId
// @access  Private/Trainer
const getTrainerMemberProgress = async (req, res) => {
  try {
    const { memberId } = req.params;
    const profile = await TrainerProfile.findOne({ userId: req.user.id });
    if (!profile) return res.status(403).json({ success: false, message: 'Trainer profile not found' });
    const plan = await WorkoutPlan.findOne({ trainerId: profile._id, memberId });
    if (!plan) return res.status(403).json({ success: false, message: 'Unauthorized member access' });

    const dashboard = await buildDashboard(memberId);
    res.status(200).json({ success: true, data: dashboard });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin view member progress
// @route   GET /api/progress/admin/member/:memberId
// @access  Private/Admin
const getAdminMemberProgress = async (req, res) => {
  try {
    const dashboard = await buildDashboard(req.params.memberId);
    res.status(200).json({ success: true, data: dashboard });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createOrUpdateProfile,
  getProfile,
  addMeasurement,
  getLatestMeasurement,
  getWeightHistory,
  getMeasurementHistory,
  createGoal,
  getGoals,
  updateGoal,
  getDashboard,
  getTrainerMemberProgress,
  getAdminMemberProgress
};
