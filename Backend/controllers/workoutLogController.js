const WorkoutLog = require('../models/WorkoutLog');
const WorkoutPlan = require('../models/WorkoutPlan');
const WorkoutPlanExercise = require('../models/WorkoutPlanExercise');
const TrainerProfile = require('../models/TrainerProfile');

// @desc    Log a completed workout exercise
// @route   POST /api/workout-logs
// @access  Private/Member
const logWorkout = async (req, res) => {
  try {
    const { workoutPlanExerciseId, performedDate } = req.body;
    if (!workoutPlanExerciseId || !performedDate) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const planExercise = await WorkoutPlanExercise.findById(workoutPlanExerciseId).populate('workoutPlanId');
    if (!planExercise) return res.status(404).json({ success: false, message: 'Plan exercise not found' });

    const plan = planExercise.workoutPlanId;
    if (plan.memberId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const log = await WorkoutLog.create({
      ...req.body,
      memberId: req.user.id,
      workoutPlanId: plan._id
    });

    res.status(201).json({ success: true, message: 'Workout logged successfully', data: log });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get member's own workout logs
// @route   GET /api/workout-logs/my
// @access  Private/Member
const getMyWorkoutLogs = async (req, res) => {
  try {
    const filter = { memberId: req.user.id };
    if (req.query.date) filter.performedDate = new Date(req.query.date);
    if (req.query.workoutPlanId) filter.workoutPlanId = req.query.workoutPlanId;
    if (req.query.exerciseId) filter.workoutPlanExerciseId = req.query.exerciseId;

    const logs = await WorkoutLog.find(filter)
      .populate('workoutPlanExerciseId')
      .populate('workoutPlanId', 'name')
      .sort({ performedDate: -1, createdAt: -1 });

    res.status(200).json({ success: true, message: 'Logs fetched', data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Trainer view member logs
// @route   GET /api/workout-logs/member/:memberId
// @access  Private/Trainer/Admin
const getMemberWorkoutLogs = async (req, res) => {
  try {
    const memberId = req.params.memberId;
    let filter = { memberId };

    if (req.user.role === 'trainer') {
      const profile = await TrainerProfile.findOne({ userId: req.user.id });
      if (!profile) return res.status(403).json({ success: false, message: 'Trainer profile not found' });

      const trainerPlans = await WorkoutPlan.find({ memberId, trainerId: profile._id });
      const planIds = trainerPlans.map(p => p._id);
      
      if (planIds.length === 0) {
        return res.status(403).json({ success: false, message: 'Unauthorized: No plans assigned to this member by you' });
      }

      filter.workoutPlanId = { $in: planIds };
    }

    const logs = await WorkoutLog.find(filter)
      .populate('workoutPlanExerciseId')
      .populate('workoutPlanId', 'name')
      .sort({ performedDate: -1 });

    res.status(200).json({ success: true, message: 'Logs fetched', data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { logWorkout, getMyWorkoutLogs, getMemberWorkoutLogs };
