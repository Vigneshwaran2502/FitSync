const TrainerProfile = require('../models/TrainerProfile');
const User = require('../models/User');
const TrainerAvailability = require('../models/TrainerAvailability');
const Appointment = require('../models/Appointment');
const WorkoutPlan = require('../models/WorkoutPlan');
const bcrypt = require('bcryptjs');

// @desc    Admin creates a trainer account and profile
// @route   POST /api/trainers
// @access  Private/Admin
const createTrainerAccount = async (req, res) => {
  try {
    const { name, email, password, phone, specialization, experienceYears, sessionPrice } = req.body;

    if (!name || !email || !password || !specialization) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name, email, password: hashedPassword, role: 'trainer', phone
    });

    const profile = await TrainerProfile.create({
      userId: user._id, specialization, experienceYears, sessionPrice
    });

    res.status(201).json({ success: true, message: 'Trainer created successfully', data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Trainer creates own profile
// @route   POST /api/trainers/profile
// @access  Private/Trainer
const createTrainerProfile = async (req, res) => {
  try {
    const profileExists = await TrainerProfile.findOne({ userId: req.user.id });
    if (profileExists) {
      return res.status(400).json({ success: false, message: 'Trainer profile already exists' });
    }

    const profile = await TrainerProfile.create({
      ...req.body,
      userId: req.user.id
    });

    res.status(201).json({ success: true, message: 'Profile created successfully', data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all active trainers
// @route   GET /api/trainers
// @access  Private
const getTrainers = async (req, res) => {
  try {
    const trainers = await TrainerProfile.find({ isAvailable: true }).populate('userId', 'name email phone');
    res.status(200).json({ success: true, message: 'Trainers fetched successfully', data: trainers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get trainer profile by ID
// @route   GET /api/trainers/:id
// @access  Private
const getTrainerById = async (req, res) => {
  try {
    const trainer = await TrainerProfile.findById(req.params.id).populate('userId', 'name email phone');
    if (!trainer) {
      return res.status(404).json({ success: false, message: 'Trainer not found' });
    }
    res.status(200).json({ success: true, message: 'Trainer fetched successfully', data: trainer });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Invalid ID' });
  }
};

// @desc    Trainer updates own profile
// @route   PUT /api/trainers/profile
// @access  Private/Trainer
const updateTrainerProfile = async (req, res) => {
  try {
    const profile = await TrainerProfile.findOneAndUpdate(
      { userId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Trainer profile not found' });
    }

    res.status(200).json({ success: true, message: 'Profile updated successfully', data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Soft delete trainer
// @route   DELETE /api/trainers/:id
// @access  Private/Admin
const deactivateTrainer = async (req, res) => {
  try {
    const trainer = await TrainerProfile.findByIdAndUpdate(req.params.id, { isAvailable: false }, { new: true });
    if (!trainer) {
      return res.status(404).json({ success: false, message: 'Trainer not found' });
    }
    res.status(200).json({ success: true, message: 'Trainer deactivated successfully', data: trainer });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Invalid ID' });
  }
};

// @desc    Get trainer schedule
// @route   GET /api/trainers/:trainerId/schedule?date=YYYY-MM-DD
// @access  Private
const getTrainerSchedule = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ success: false, message: 'Please provide a date query parameter' });

    const scheduleDate = new Date(date);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = days[scheduleDate.getDay()];

    const availabilities = await TrainerAvailability.find({ 
      trainerId: req.params.trainerId, 
      dayOfWeek,
      isAvailable: true 
    });

    const startOfDay = new Date(date);
    startOfDay.setHours(0,0,0,0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23,59,59,999);

    const appointments = await Appointment.find({
      trainerId: req.params.trainerId,
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['pending', 'confirmed'] }
    });

    res.status(200).json({
      success: true,
      message: 'Schedule fetched successfully',
      data: {
        date,
        dayOfWeek,
        availabilities,
        appointments
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get members assigned to this trainer (via appointments or workout plans)
// @route   GET /api/trainers/my/members
// @access  Private/Trainer
const getMyAssignedMembers = async (req, res) => {
  try {
    const profile = await TrainerProfile.findOne({ userId: req.user.id });
    if (!profile) return res.status(404).json({ success: false, message: 'Trainer profile not found' });

    // Find all members who have appointments with this trainer
    const appointments = await Appointment.find({ trainerId: profile._id }).select('memberId');
    const plans = await WorkoutPlan.find({ trainerId: profile._id }).select('memberId');
    
    // Combine and deduplicate member IDs
    const memberIds = [...new Set([
      ...appointments.map(a => a.memberId.toString()),
      ...plans.map(p => p.memberId.toString())
    ])];

    const members = await User.find({ _id: { $in: memberIds } }).select('name email phone profileImage');

    res.status(200).json({ success: true, data: members });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createTrainerAccount,
  createTrainerProfile,
  getTrainers,
  getTrainerById,
  updateTrainerProfile,
  deactivateTrainer,
  getTrainerSchedule,
  getMyAssignedMembers
};
