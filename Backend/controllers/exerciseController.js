const Exercise = require('../models/Exercise');
const WorkoutPlanExercise = require('../models/WorkoutPlanExercise');

// @desc    Create an exercise
// @route   POST /api/exercises
// @access  Private/Admin/Trainer
const createExercise = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Exercise name is required' });
    
    const exists = await Exercise.findOne({ name });
    if (exists) return res.status(400).json({ success: false, message: 'Exercise already exists' });

    const exercise = await Exercise.create(req.body);
    res.status(201).json({ success: true, message: 'Exercise created successfully', data: exercise });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all active exercises
// @route   GET /api/exercises
// @access  Private
const getExercises = async (req, res) => {
  try {
    const exercises = await Exercise.find({ isActive: true }).sort('name');
    res.status(200).json({ success: true, message: 'Exercises fetched successfully', data: exercises });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get exercise by ID
// @route   GET /api/exercises/:id
// @access  Private
const getExerciseById = async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) return res.status(404).json({ success: false, message: 'Exercise not found' });
    res.status(200).json({ success: true, message: 'Exercise fetched successfully', data: exercise });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Invalid ID' });
  }
};

// @desc    Update exercise
// @route   PUT /api/exercises/:id
// @access  Private/Admin/Trainer
const updateExercise = async (req, res) => {
  try {
    const exercise = await Exercise.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!exercise) return res.status(404).json({ success: false, message: 'Exercise not found' });
    res.status(200).json({ success: true, message: 'Exercise updated successfully', data: exercise });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Soft delete exercise
// @route   DELETE /api/exercises/:id
// @access  Private/Admin/Trainer
const deleteExercise = async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) return res.status(404).json({ success: false, message: 'Exercise not found' });
    
    // Check if used in workout plans
    const used = await WorkoutPlanExercise.findOne({ exerciseId: req.params.id });
    if (used) {
      exercise.isActive = false;
      await exercise.save();
      return res.status(200).json({ success: true, message: 'Exercise deactivated as it is used in plans', data: exercise });
    }

    await exercise.deleteOne();
    res.status(200).json({ success: true, message: 'Exercise deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createExercise, getExercises, getExerciseById, updateExercise, deleteExercise };
