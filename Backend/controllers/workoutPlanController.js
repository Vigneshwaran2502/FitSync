const WorkoutPlan = require('../models/WorkoutPlan');
const WorkoutPlanExercise = require('../models/WorkoutPlanExercise');
const WorkoutLog = require('../models/WorkoutLog');
const Exercise = require('../models/Exercise');
const User = require('../models/User');
const TrainerProfile = require('../models/TrainerProfile');
const Subscription = require('../models/Subscription');
const { notifyWorkoutAssignment } = require('../services/notificationService');

// @desc    Create workout plan
// @route   POST /api/workout-plans
// @access  Private/Trainer
const createWorkoutPlan = async (req, res) => {
  try {
    const { memberId, name, durationWeeks, startDate } = req.body;
    if (!memberId || !name || !durationWeeks || !startDate) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const trainerProfile = await TrainerProfile.findOne({ userId: req.user.id });
    if (!trainerProfile) return res.status(403).json({ success: false, message: 'Trainer profile not found' });

    const member = await User.findById(memberId);
    if (!member || member.role !== 'member') return res.status(404).json({ success: false, message: 'Member not found' });

    // Validate Subscription
    const currentDate = new Date();
    const activeSub = await Subscription.findOne({
      member: memberId,
      status: 'active',
      currentEndDate: { $gte: currentDate }
    });
    if (!activeSub) return res.status(403).json({ success: false, message: 'Member does not have an active subscription' });

    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + (durationWeeks * 7));

    const plan = await WorkoutPlan.create({
      ...req.body,
      trainerId: trainerProfile._id,
      endDate: end
    });

    await notifyWorkoutAssignment(memberId, plan._id);

    res.status(201).json({ success: true, message: 'Workout plan created successfully', data: plan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get trainer's created workout plans
// @route   GET /api/workout-plans/trainer/my
// @access  Private/Trainer
const getTrainerWorkoutPlans = async (req, res) => {
  try {
    const trainerProfile = await TrainerProfile.findOne({ userId: req.user.id });
    if (!trainerProfile) return res.status(403).json({ success: false, message: 'Trainer profile not found' });

    const plans = await WorkoutPlan.find({ trainerId: trainerProfile._id }).populate('memberId', 'name email');
    res.status(200).json({ success: true, message: 'Plans fetched successfully', data: plans });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get member's assigned workout plans
// @route   GET /api/workout-plans/my
// @access  Private/Member
const getMemberWorkoutPlans = async (req, res) => {
  try {
    const plans = await WorkoutPlan.find({ memberId: req.user.id }).populate('trainerId');
    res.status(200).json({ success: true, message: 'Plans fetched successfully', data: plans });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get plan by ID
// @route   GET /api/workout-plans/:id
// @access  Private
const getWorkoutPlanById = async (req, res) => {
  try {
    const plan = await WorkoutPlan.findById(req.params.id).populate('memberId', 'name email').populate('trainerId');
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });

    if (req.user.role === 'member' && plan.memberId._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    if (req.user.role === 'trainer') {
      const profile = await TrainerProfile.findOne({ userId: req.user.id });
      if (!profile || plan.trainerId._id.toString() !== profile._id.toString()) {
         return res.status(403).json({ success: false, message: 'Unauthorized' });
      }
    }

    res.status(200).json({ success: true, message: 'Plan fetched successfully', data: plan });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Invalid ID' });
  }
};

// @desc    Update plan
// @route   PUT /api/workout-plans/:id
// @access  Private/Trainer/Admin
const updateWorkoutPlan = async (req, res) => {
  try {
    const plan = await WorkoutPlan.findById(req.params.id);
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });

    if (req.user.role === 'trainer') {
      const profile = await TrainerProfile.findOne({ userId: req.user.id });
      if (!profile || plan.trainerId.toString() !== profile._id.toString()) {
         return res.status(403).json({ success: false, message: 'Unauthorized' });
      }
    }

    delete req.body.memberId; // Prevents reassigning members randomly
    const updated = await WorkoutPlan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, message: 'Plan updated successfully', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add exercise to plan
// @route   POST /api/workout-plans/:id/exercises
// @access  Private/Trainer
const addExerciseToPlan = async (req, res) => {
  try {
    const { exerciseId, dayNumber } = req.body;
    if (!exerciseId || !dayNumber) return res.status(400).json({ success: false, message: 'Exercise ID and Day Number required' });

    const plan = await WorkoutPlan.findById(req.params.id);
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });

    const profile = await TrainerProfile.findOne({ userId: req.user.id });
    if (!profile || plan.trainerId.toString() !== profile._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const exercise = await Exercise.findById(exerciseId);
    if (!exercise || !exercise.isActive) return res.status(400).json({ success: false, message: 'Exercise not found or inactive' });

    const planExercise = await WorkoutPlanExercise.create({
      ...req.body,
      workoutPlanId: plan._id
    });

    res.status(201).json({ success: true, message: 'Exercise added to plan', data: planExercise });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get exercises for plan
// @route   GET /api/workout-plans/:id/exercises
// @access  Private
const getPlanExercises = async (req, res) => {
  try {
    const plan = await WorkoutPlan.findById(req.params.id);
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });
    
    const exercises = await WorkoutPlanExercise.find({ workoutPlanId: plan._id })
      .populate('exerciseId')
      .sort({ dayNumber: 1, order: 1 });
      
    res.status(200).json({ success: true, message: 'Exercises fetched', data: exercises });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update exercise in plan
// @route   PUT /api/workout-plan-exercises/:id
// @access  Private/Trainer
const updatePlanExercise = async (req, res) => {
  try {
    const planExercise = await WorkoutPlanExercise.findById(req.params.id).populate('workoutPlanId');
    if (!planExercise) return res.status(404).json({ success: false, message: 'Plan exercise not found' });

    const profile = await TrainerProfile.findOne({ userId: req.user.id });
    if (!profile || planExercise.workoutPlanId.trainerId.toString() !== profile._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const updated = await WorkoutPlanExercise.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, message: 'Plan exercise updated', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove exercise from plan
// @route   DELETE /api/workout-plan-exercises/:id
// @access  Private/Trainer
const removePlanExercise = async (req, res) => {
  try {
    const planExercise = await WorkoutPlanExercise.findById(req.params.id).populate('workoutPlanId');
    if (!planExercise) return res.status(404).json({ success: false, message: 'Plan exercise not found' });

    const profile = await TrainerProfile.findOne({ userId: req.user.id });
    if (!profile || planExercise.workoutPlanId.trainerId.toString() !== profile._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    await planExercise.deleteOne();
    res.status(200).json({ success: true, message: 'Exercise removed from plan' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get plan progress
// @route   GET /api/workout-plans/:id/progress
// @access  Private
const getPlanProgress = async (req, res) => {
  try {
    const planExercises = await WorkoutPlanExercise.find({ workoutPlanId: req.params.id });
    const totalExercises = planExercises.length;
    
    const loggedCount = await WorkoutLog.distinct('workoutPlanExerciseId', { workoutPlanId: req.params.id });
    const completedExercises = loggedCount.length;
    
    const completionPercentage = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;

    res.status(200).json({
      success: true,
      message: 'Progress calculated',
      data: {
        totalExercises,
        completedExercises,
        completionPercentage: Number(completionPercentage.toFixed(2))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  createWorkoutPlan,
  getTrainerWorkoutPlans,
  getMemberWorkoutPlans,
  getWorkoutPlanById,
  updateWorkoutPlan,
  addExerciseToPlan,
  getPlanExercises,
  updatePlanExercise,
  removePlanExercise,
  getPlanProgress
};
