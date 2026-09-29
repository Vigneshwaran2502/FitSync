const Appointment = require('../models/Appointment');
const TrainerProfile = require('../models/TrainerProfile');
const TrainerAvailability = require('../models/TrainerAvailability');
const Subscription = require('../models/Subscription');

// Helper to add minutes to HH:mm string
function addMinutes(time, minsToAdd) {
  const [h, m] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(h, m, 0, 0);
  date.setMinutes(date.getMinutes() + minsToAdd);
  return date.toTimeString().slice(0, 5);
}

// @desc    Book an appointment
// @route   POST /api/appointments
// @access  Private/Member
const createAppointment = async (req, res) => {
  try {
    const { trainerId, appointmentDate, startTime, duration, notes } = req.body;
    
    if (!trainerId || !appointmentDate || !startTime || !duration) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    // 1. Verify Member has active subscription
    const currentDate = new Date();
    const activeSub = await Subscription.findOne({
      member: req.user.id,
      status: 'active',
      currentEndDate: { $gte: currentDate }
    }).populate('membershipPlan');

    if (!activeSub) {
      return res.status(403).json({ success: false, message: 'An active membership is required to book a trainer' });
    }

    // 2. Check Trainer Session Limits
    if (activeSub.membershipPlan.maxTrainerSessions > 0) {
      const usedSessions = await Appointment.countDocuments({
        memberId: req.user.id,
        status: { $in: ['pending', 'confirmed', 'completed'] },
        appointmentDate: { $gte: activeSub.startDate, $lte: activeSub.currentEndDate }
      });

      if (usedSessions >= activeSub.membershipPlan.maxTrainerSessions) {
        return res.status(403).json({ success: false, message: 'Your trainer session limit for this membership has been reached' });
      }
    }

    // 3. Verify Trainer Exists
    const trainer = await TrainerProfile.findById(trainerId);
    if (!trainer || !trainer.isAvailable) {
      return res.status(404).json({ success: false, message: 'Trainer not found or unavailable' });
    }

    const apptDate = new Date(appointmentDate);
    apptDate.setHours(0,0,0,0);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = days[apptDate.getDay()];
    const endTime = addMinutes(startTime, duration);

    // 4. Verify Trainer Availability for the day and time
    const availabilities = await TrainerAvailability.find({ trainerId, dayOfWeek, isAvailable: true });
    let isWithinAvailability = false;
    for (let slot of availabilities) {
      if (startTime >= slot.startTime && endTime <= slot.endTime) {
        isWithinAvailability = true;
        break;
      }
    }

    if (!isWithinAvailability) {
      return res.status(400).json({ success: false, message: 'Trainer is not available at the requested time' });
    }

    // 5. Check Double Booking
    const startOfDay = new Date(apptDate);
    const endOfDay = new Date(apptDate);
    endOfDay.setHours(23,59,59,999);

    const existingAppointments = await Appointment.find({
      trainerId,
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['pending', 'confirmed'] }
    });

    for (let appt of existingAppointments) {
      if ((startTime < appt.endTime) && (endTime > appt.startTime)) {
        return res.status(409).json({ success: false, message: 'Trainer is already booked during this time' });
      }
    }

    // 6. Create Appointment
    const appointment = await Appointment.create({
      memberId: req.user.id,
      trainerId,
      appointmentDate: apptDate,
      startTime,
      endTime,
      duration,
      notes,
      createdBy: req.user.id
    });

    res.status(201).json({ success: true, message: 'Appointment booked successfully', data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get member's appointments
// @route   GET /api/appointments/my
// @access  Private/Member
const getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ memberId: req.user.id })
      .populate('trainerId')
      .sort({ appointmentDate: 1, startTime: 1 });
    res.status(200).json({ success: true, message: 'Appointments fetched successfully', data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get trainer's appointments
// @route   GET /api/appointments/trainer/my
// @access  Private/Trainer
const getTrainerAppointments = async (req, res) => {
  try {
    const profile = await TrainerProfile.findOne({ userId: req.user.id });
    if (!profile) return res.status(404).json({ success: false, message: 'Trainer profile not found' });

    const appointments = await Appointment.find({ trainerId: profile._id })
      .populate('memberId', 'name email phone')
      .sort({ appointmentDate: 1, startTime: 1 });
    res.status(200).json({ success: true, message: 'Appointments fetched successfully', data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Admin view all appointments
// @route   GET /api/appointments
// @access  Private/Admin
const getAllAppointments = async (req, res) => {
  try {
    const filter = {};
    if (req.query.date) {
        const d = new Date(req.query.date);
        d.setHours(0,0,0,0);
        const end = new Date(d);
        end.setHours(23,59,59,999);
        filter.appointmentDate = { $gte: d, $lte: end };
    }
    if (req.query.status) filter.status = req.query.status;
    if (req.query.trainerId) filter.trainerId = req.query.trainerId;
    if (req.query.memberId) filter.memberId = req.query.memberId;

    const appointments = await Appointment.find(filter)
      .populate('memberId', 'name email phone')
      .populate('trainerId', 'specialization')
      .sort({ appointmentDate: -1 });

    res.status(200).json({ success: true, message: 'Appointments fetched successfully', data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get appointment by ID
// @route   GET /api/appointments/:id
// @access  Private
const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('memberId', 'name email phone')
      .populate('trainerId');
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

    if (req.user.role === 'member' && appointment.memberId._id.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    if (req.user.role === 'trainer') {
        const profile = await TrainerProfile.findOne({ userId: req.user.id });
        if (!profile || appointment.trainerId._id.toString() !== profile._id.toString()) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }
    }

    res.status(200).json({ success: true, message: 'Appointment fetched successfully', data: appointment });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Invalid ID' });
  }
};

// @desc    Confirm appointment
// @route   PUT /api/appointments/:id/confirm
// @access  Private/Trainer/Admin
const confirmAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

    if (req.user.role === 'trainer') {
        const profile = await TrainerProfile.findOne({ userId: req.user.id });
        if (!profile || appointment.trainerId.toString() !== profile._id.toString()) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }
    }

    appointment.status = 'confirmed';
    await appointment.save();

    res.status(200).json({ success: true, message: 'Appointment confirmed', data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel appointment
// @route   PUT /api/appointments/:id/cancel
// @access  Private
const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

    if (req.user.role === 'member' && appointment.memberId.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    if (req.user.role === 'trainer') {
        const profile = await TrainerProfile.findOne({ userId: req.user.id });
        if (!profile || appointment.trainerId.toString() !== profile._id.toString()) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }
    }

    appointment.status = 'cancelled';
    if (req.body && req.body.cancelReason) {
        appointment.cancelReason = req.body.cancelReason;
    }
    await appointment.save();

    res.status(200).json({ success: true, message: 'Appointment cancelled', data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Complete appointment
// @route   PUT /api/appointments/:id/complete
// @access  Private/Trainer/Admin
const completeAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

    if (req.user.role === 'trainer') {
        const profile = await TrainerProfile.findOne({ userId: req.user.id });
        if (!profile || appointment.trainerId.toString() !== profile._id.toString()) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }
    }

    const apptDate = new Date(appointment.appointmentDate);
    const [h, m] = appointment.endTime.split(':').map(Number);
    apptDate.setHours(h, m, 0, 0);

    if (apptDate > new Date()) {
        return res.status(400).json({ success: false, message: 'Cannot complete a future appointment' });
    }

    appointment.status = 'completed';
    await appointment.save();

    res.status(200).json({ success: true, message: 'Appointment marked as completed', data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark no-show
// @route   PUT /api/appointments/:id/no-show
// @access  Private/Trainer/Admin
const noShowAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

    if (req.user.role === 'trainer') {
        const profile = await TrainerProfile.findOne({ userId: req.user.id });
        if (!profile || appointment.trainerId.toString() !== profile._id.toString()) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }
    }

    appointment.status = 'no_show';
    await appointment.save();

    res.status(200).json({ success: true, message: 'Appointment marked as no_show', data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createAppointment,
  getMyAppointments,
  getTrainerAppointments,
  getAllAppointments,
  getAppointmentById,
  confirmAppointment,
  cancelAppointment,
  completeAppointment,
  noShowAppointment
};
