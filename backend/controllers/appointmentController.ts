import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { Appointment } from '../models/Appointment.js';
import { Notification } from '../models/Notification.js';
import { User } from '../models/User.js';

export async function getAppointments(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated.' });

    const { status, date } = req.query;
    const query: any = {};
    if (status) query.status = status;
    if (date) query.date = date;

    if (req.user.role === 'member') {
      query.memberId = req.user._id;
    } else if (req.user.role === 'trainer') {
      query.trainerId = req.user._id;
    }
    // Admin sees all

    const appointments = await Appointment.find(query)
      .populate('memberId', 'name email phone')
      .populate('trainerId', 'name email phone')
      .sort({ date: 1, startTime: 1 });

    res.json({ appointments });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error fetching appointments.' });
  }
}

export async function createAppointment(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated.' });

    const { trainerId, memberId, date, startTime, endTime, topic, notes } = req.body;

    const actualMemberId = req.user.role === 'member' ? req.user._id : (memberId || req.user._id);

    if (!trainerId || !date || !startTime || !endTime) {
      return res.status(400).json({ message: 'Trainer, date, and time range are required.' });
    }

    // Prevent double booking for the same trainer on the same date and overlapping time
    const existing = await Appointment.findOne({
      trainerId,
      date,
      startTime,
      status: { $in: ['pending', 'confirmed'] },
    });

    if (existing) {
      return res.status(409).json({
        message: 'This time slot is already reserved with this trainer. Please choose another time.',
      });
    }

    const appointment = await Appointment.create({
      memberId: actualMemberId,
      trainerId,
      date,
      startTime,
      endTime,
      topic: topic || 'Personal Training Consultation',
      notes: notes || '',
      status: 'pending',
    });

    const member = await User.findById(actualMemberId);
    const trainer = await User.findById(trainerId);

    // Notify trainer
    await Notification.create({
      userId: trainerId,
      title: 'New Appointment Booking',
      message: `${member?.name || 'A member'} booked a session on ${date} at ${startTime}.`,
      type: 'appointment',
      actionUrl: '/trainer/appointments',
    });

    res.status(201).json({ message: 'Appointment booked successfully.', appointment });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error creating appointment.' });
  }
}

export async function updateAppointmentStatus(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }

    appointment.status = status;
    if (rejectionReason) appointment.rejectionReason = rejectionReason;
    await appointment.save();

    // Notify the member about status change
    await Notification.create({
      userId: appointment.memberId,
      title: `Appointment ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: `Your session on ${appointment.date} at ${appointment.startTime} was marked as '${status}'.`,
      type: 'appointment',
      actionUrl: '/member/appointments',
    });

    res.json({ message: `Appointment status updated to ${status}.`, appointment });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error updating appointment status.' });
  }
}

export async function cancelAppointment(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    res.json({ message: 'Appointment cancelled.', appointment });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error cancelling appointment.' });
  }
}
