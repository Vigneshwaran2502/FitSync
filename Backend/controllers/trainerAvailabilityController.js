const TrainerAvailability = require('../models/TrainerAvailability');
const TrainerProfile = require('../models/TrainerProfile');

// @desc    Create trainer availability
// @route   POST /api/trainers/availability
// @access  Private/Trainer
const createAvailability = async (req, res) => {
  try {
    const { dayOfWeek, startTime, endTime } = req.body;
    
    if (!dayOfWeek || !startTime || !endTime) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }
    
    if (startTime >= endTime) {
      return res.status(400).json({ success: false, message: 'Start time must be before end time' });
    }

    const trainer = await TrainerProfile.findOne({ userId: req.user.id });
    if (!trainer) {
      return res.status(404).json({ success: false, message: 'Trainer profile not found' });
    }

    // Check overlaps
    const existing = await TrainerAvailability.find({ trainerId: trainer._id, dayOfWeek, isAvailable: true });
    for (let slot of existing) {
      if ((startTime < slot.endTime) && (endTime > slot.startTime)) {
        return res.status(409).json({ success: false, message: 'Availability slot overlaps with existing slot' });
      }
    }

    const availability = await TrainerAvailability.create({
      trainerId: trainer._id, dayOfWeek, startTime, endTime
    });

    res.status(201).json({ success: true, message: 'Availability created successfully', data: availability });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get trainer availability
// @route   GET /api/trainers/:trainerId/availability
// @access  Private
const getAvailability = async (req, res) => {
  try {
    const availabilities = await TrainerAvailability.find({ trainerId: req.params.trainerId, isAvailable: true });
    res.status(200).json({ success: true, message: 'Availability fetched successfully', data: availabilities });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Invalid ID' });
  }
};

// @desc    Update availability
// @route   PUT /api/trainers/availability/:id
// @access  Private/Trainer
const updateAvailability = async (req, res) => {
  try {
    const availability = await TrainerAvailability.findById(req.params.id);
    if (!availability) return res.status(404).json({ success: false, message: 'Availability not found' });

    const trainer = await TrainerProfile.findOne({ userId: req.user.id });
    if (availability.trainerId.toString() !== trainer._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const updated = await TrainerAvailability.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, message: 'Availability updated successfully', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete availability
// @route   DELETE /api/trainers/availability/:id
// @access  Private/Trainer
const deleteAvailability = async (req, res) => {
  try {
    const availability = await TrainerAvailability.findById(req.params.id);
    if (!availability) return res.status(404).json({ success: false, message: 'Availability not found' });

    const trainer = await TrainerProfile.findOne({ userId: req.user.id });
    // Admin can delete, or trainer who owns it
    if (req.user.role !== 'admin' && availability.trainerId.toString() !== trainer._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    await availability.deleteOne();
    res.status(200).json({ success: true, message: 'Availability removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createAvailability,
  getAvailability,
  updateAvailability,
  deleteAvailability
};
