import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { User } from '../models/User.js';
import { TrainerProfile } from '../models/TrainerProfile.js';
import { TrainerAvailability } from '../models/TrainerAvailability.js';
import { WorkoutPlan } from '../models/WorkoutPlan.js';
import { FitnessProfile } from '../models/FitnessProfile.js';
import { Appointment } from '../models/Appointment.js';

export async function getTrainers(req: AuthRequest, res: Response) {
  try {
    const trainers = await User.find({ role: 'trainer', status: 'active' }).select('-password');
    const trainerIds = trainers.map((t) => t._id);

    const profiles = await TrainerProfile.find({ userId: { $in: trainerIds } });
    const profileMap = new Map();
    profiles.forEach((p) => profileMap.set(p.userId.toString(), p));

    const enriched = trainers.map((trainer) => ({
      ...trainer.toObject(),
      profile: profileMap.get(trainer._id.toString()) || null,
    }));

    res.json({ trainers: enriched });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error fetching trainers.' });
  }
}

export async function getTrainerById(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const trainer = await User.findOne({ _id: id, role: 'trainer' }).select('-password');
    if (!trainer) {
      return res.status(404).json({ message: 'Trainer not found.' });
    }

    const profile = await TrainerProfile.findOne({ userId: trainer._id });
    const availability = await TrainerAvailability.find({ trainerId: trainer._id });

    res.json({
      trainer,
      profile,
      availability,
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error fetching trainer details.' });
  }
}

export async function updateTrainerProfile(req: AuthRequest, res: Response) {
  try {
    if (!req.user || req.user.role !== 'trainer') {
      return res.status(403).json({ message: 'Only trainers can update their trainer profile.' });
    }

    const { specialization, experienceYears, bio, certifications, hourlyRate, isAvailable } = req.body;

    let profile = await TrainerProfile.findOne({ userId: req.user._id });
    if (!profile) {
      profile = new TrainerProfile({ userId: req.user._id });
    }

    if (specialization) profile.specialization = Array.isArray(specialization) ? specialization : [specialization];
    if (experienceYears !== undefined) profile.experienceYears = Number(experienceYears);
    if (bio !== undefined) profile.bio = bio;
    if (certifications) profile.certifications = Array.isArray(certifications) ? certifications : [certifications];
    if (hourlyRate !== undefined) profile.hourlyRate = Number(hourlyRate);
    if (isAvailable !== undefined) profile.isAvailable = isAvailable;

    await profile.save();
    res.json({ message: 'Trainer profile updated successfully.', profile });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error updating trainer profile.' });
  }
}

export async function getTrainerAvailability(req: AuthRequest, res: Response) {
  try {
    const trainerId = req.params.id || req.user?._id;
    const availability = await TrainerAvailability.find({ trainerId }).sort({ dayOfWeek: 1 });
    res.json({ availability });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error fetching availability.' });
  }
}

export async function setTrainerAvailability(req: AuthRequest, res: Response) {
  try {
    if (!req.user || (req.user.role !== 'trainer' && req.user.role !== 'admin')) {
      return res.status(403).json({ message: 'Forbidden.' });
    }

    const trainerId = req.user.role === 'admin' && req.body.trainerId ? req.body.trainerId : req.user._id;
    const { slots } = req.body; // Array of { dayOfWeek, startTime, endTime, isAvailable }

    if (!Array.isArray(slots)) {
      return res.status(400).json({ message: 'Expected an array of slots.' });
    }

    for (const slot of slots) {
      await TrainerAvailability.findOneAndUpdate(
        { trainerId, dayOfWeek: slot.dayOfWeek },
        {
          startTime: slot.startTime,
          endTime: slot.endTime,
          isAvailable: slot.isAvailable !== false,
        },
        { upsert: true, new: true }
      );
    }

    const updated = await TrainerAvailability.find({ trainerId });
    res.json({ message: 'Availability schedule updated.', availability: updated });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error setting availability.' });
  }
}

export async function getTrainerMembers(req: AuthRequest, res: Response) {
  try {
    if (!req.user || (req.user.role !== 'trainer' && req.user.role !== 'admin')) {
      return res.status(403).json({ message: 'Forbidden.' });
    }

    const trainerId = req.user.role === 'admin' && req.query.trainerId ? req.query.trainerId : req.user._id;

    // Find members with workout plans by this trainer or assigned in fitness profile
    const workoutPlans = await WorkoutPlan.find({ trainerId }).distinct('memberId');
    const assignedProfiles = await FitnessProfile.find({ assignedTrainerId: trainerId }).distinct('userId');
    const appointmentMembers = await Appointment.find({ trainerId }).distinct('memberId');

    const memberIds = Array.from(new Set([...workoutPlans, ...assignedProfiles, ...appointmentMembers].map(String)));

    const members = await User.find({ _id: { $in: memberIds } }).select('-password');
    const profiles = await FitnessProfile.find({ userId: { $in: memberIds } });
    const pMap = new Map();
    profiles.forEach((p) => pMap.set(p.userId.toString(), p));

    const enriched = members.map((m) => ({
      ...m.toObject(),
      fitnessProfile: pMap.get(m._id.toString()) || null,
    }));

    res.json({ members: enriched });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error fetching assigned members.' });
  }
}
