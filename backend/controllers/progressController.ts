import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { FitnessProfile } from '../models/FitnessProfile.js';
import { FitnessMeasurement } from '../models/FitnessMeasurement.js';
import { FitnessGoal } from '../models/FitnessGoal.js';
import { Attendance } from '../models/Attendance.js';
import { WorkoutPlan } from '../models/WorkoutPlan.js';
import { WorkoutLog } from '../models/WorkoutLog.js';
import { Notification } from '../models/Notification.js';

export async function getFitnessProfile(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated.' });

    const targetUserId =
      (req.user.role === 'admin' || req.user.role === 'trainer') && req.params.userId
        ? req.params.userId
        : req.user._id;

    let profile = await FitnessProfile.findOne({ userId: targetUserId }).populate(
      'assignedTrainerId',
      'name email phone'
    );

    if (!profile) {
      profile = await FitnessProfile.create({
        userId: targetUserId,
        heightCm: 175,
        currentWeightKg: 70,
        targetWeightKg: 70,
        fitnessGoal: 'General Health',
        fitnessLevel: 'Beginner',
        onboardingCompleted: false,
      });
    }

    res.json({ profile });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error fetching fitness profile.' });
  }
}

export async function updateFitnessProfile(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated.' });

    const targetUserId =
      (req.user.role === 'admin' || req.user.role === 'trainer') && req.body.userId
        ? req.body.userId
        : req.user._id;

    const {
      heightCm,
      currentWeightKg,
      targetWeightKg,
      dateOfBirth,
      gender,
      fitnessGoal,
      fitnessLevel,
      medicalConditions,
      assignedTrainerId,
      onboardingCompleted,
    } = req.body;

    let profile = await FitnessProfile.findOne({ userId: targetUserId });
    if (!profile) {
      profile = new FitnessProfile({ userId: targetUserId });
    }

    if (heightCm !== undefined) profile.heightCm = Number(heightCm);
    if (currentWeightKg !== undefined) profile.currentWeightKg = Number(currentWeightKg);
    if (targetWeightKg !== undefined) profile.targetWeightKg = Number(targetWeightKg);
    if (dateOfBirth) profile.dateOfBirth = dateOfBirth;
    if (gender) profile.gender = gender;
    if (fitnessGoal) profile.fitnessGoal = fitnessGoal;
    if (fitnessLevel) profile.fitnessLevel = fitnessLevel;
    if (medicalConditions !== undefined) profile.medicalConditions = medicalConditions;
    if (assignedTrainerId) profile.assignedTrainerId = assignedTrainerId;
    if (onboardingCompleted !== undefined) profile.onboardingCompleted = Boolean(onboardingCompleted);

    await profile.save();

    // Also record a measurement if weight provided
    if (currentWeightKg) {
      const todayStr = new Date().toISOString().split('T')[0];
      await FitnessMeasurement.findOneAndUpdate(
        { userId: targetUserId, date: todayStr },
        { weightKg: Number(currentWeightKg) },
        { upsert: true }
      );
    }

    res.json({ message: 'Fitness profile updated successfully.', profile });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error updating fitness profile.' });
  }
}

export async function getMeasurements(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated.' });

    const targetUserId =
      (req.user.role === 'admin' || req.user.role === 'trainer') && req.query.userId
        ? req.query.userId
        : req.user._id;

    const measurements = await FitnessMeasurement.find({ userId: targetUserId }).sort({ date: 1 });
    res.json({ measurements });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error fetching measurements.' });
  }
}

export async function addMeasurement(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated.' });

    const { date, weightKg, chestCm, waistCm, hipsCm, armsCm, thighsCm, bodyFatPercent, notes, userId } = req.body;
    const targetUserId = req.user.role === 'admin' && userId ? userId : req.user._id;

    if (!weightKg) {
      return res.status(400).json({ message: 'Weight is required.' });
    }

    const measurement = await FitnessMeasurement.create({
      userId: targetUserId,
      date: date || new Date().toISOString().split('T')[0],
      weightKg: Number(weightKg),
      chestCm: chestCm ? Number(chestCm) : undefined,
      waistCm: waistCm ? Number(waistCm) : undefined,
      hipsCm: hipsCm ? Number(hipsCm) : undefined,
      armsCm: armsCm ? Number(armsCm) : undefined,
      thighsCm: thighsCm ? Number(thighsCm) : undefined,
      bodyFatPercent: bodyFatPercent ? Number(bodyFatPercent) : undefined,
      notes: notes || '',
    });

    // Update profile currentWeight
    await FitnessProfile.findOneAndUpdate(
      { userId: targetUserId },
      { currentWeightKg: Number(weightKg) }
    );

    res.status(201).json({ message: 'Measurement logged successfully.', measurement });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error logging measurement.' });
  }
}

export async function getGoals(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated.' });

    const targetUserId =
      (req.user.role === 'admin' || req.user.role === 'trainer') && req.query.userId
        ? req.query.userId
        : req.user._id;

    const goals = await FitnessGoal.find({ userId: targetUserId }).sort({ createdAt: -1 });
    res.json({ goals });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error fetching goals.' });
  }
}

export async function createGoal(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated.' });

    const { title, category, targetValue, currentValue, unit, targetDate, notes } = req.body;

    if (!title || targetValue === undefined || !targetDate) {
      return res.status(400).json({ message: 'Title, target value, and target date are required.' });
    }

    const goal = await FitnessGoal.create({
      userId: req.user._id,
      title: title.trim(),
      category: category || 'Weight',
      targetValue: Number(targetValue),
      currentValue: currentValue !== undefined ? Number(currentValue) : 0,
      unit: unit || 'kg',
      targetDate,
      notes: notes || '',
      status: 'active',
    });

    res.status(201).json({ message: 'Fitness goal set successfully.', goal });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error creating fitness goal.' });
  }
}

export async function updateGoal(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { title, targetValue, currentValue, unit, targetDate, status, notes } = req.body;

    const goal = await FitnessGoal.findById(id);
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found.' });
    }

    if (title) goal.title = title.trim();
    if (targetValue !== undefined) goal.targetValue = Number(targetValue);
    if (currentValue !== undefined) goal.currentValue = Number(currentValue);
    if (unit) goal.unit = unit;
    if (targetDate) goal.targetDate = targetDate;
    if (notes !== undefined) goal.notes = notes;

    const wasActive = goal.status === 'active';
    if (status) goal.status = status;

    // Check if achieved or marked achieved
    if (status === 'achieved' && wasActive) {
      await Notification.create({
        userId: goal.userId,
        title: 'Goal Achieved!',
        message: `Outstanding! You achieved your milestone: '${goal.title}'. Keep up the momentum!`,
        type: 'goal',
        actionUrl: '/member/progress',
      });
    }

    await goal.save();
    res.json({ message: 'Goal updated.', goal });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error updating goal.' });
  }
}

export async function deleteGoal(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    await FitnessGoal.findByIdAndDelete(id);
    res.json({ message: 'Goal deleted successfully.' });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error deleting goal.' });
  }
}

export async function getProgressDashboard(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated.' });

    const targetUserId =
      (req.user.role === 'admin' || req.user.role === 'trainer') && req.query.userId
        ? req.query.userId
        : req.user._id;

    const profile = await FitnessProfile.findOne({ userId: targetUserId });
    const measurements = await FitnessMeasurement.find({ userId: targetUserId }).sort({ date: 1 });
    const goals = await FitnessGoal.find({ userId: targetUserId });
    const attendanceRecords = await Attendance.find({ userId: targetUserId });
    const workoutPlans = await WorkoutPlan.find({ memberId: targetUserId });
    const workoutLogs = await WorkoutLog.find({ memberId: targetUserId });

    const startingWeight = measurements.length > 0 ? measurements[0].weightKg : (profile?.currentWeightKg || 70);
    const currentWeight = profile?.currentWeightKg || (measurements.length > 0 ? measurements[measurements.length - 1].weightKg : 70);
    const targetWeight = profile?.targetWeightKg || 70;
    const weightChange = Number((currentWeight - startingWeight).toFixed(1));

    const heightInMeters = (profile?.heightCm || 175) / 100;
    const bmi = Number((currentWeight / (heightInMeters * heightInMeters)).toFixed(1));

    // Attendance stats: attendance this month (assuming 20 standard monthly target days)
    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const thisMonthAttendance = attendanceRecords.filter((a) => a.date.startsWith(currentMonthStr));
    const attendancePercentage = Math.min(100, Math.round((thisMonthAttendance.length / 20) * 100));

    // Workout completion
    const activeGoals = goals.filter((g) => g.status === 'active');
    const achievedGoals = goals.filter((g) => g.status === 'achieved');

    // Weight history format for Recharts
    const weightHistory = measurements.map((m) => ({
      date: m.date,
      weight: m.weightKg,
      target: targetWeight,
      bodyFat: m.bodyFatPercent,
    }));

    res.json({
      startingWeight,
      currentWeight,
      targetWeight,
      weightChange,
      bmi,
      totalAttendanceDays: attendanceRecords.length,
      thisMonthAttendanceDays: thisMonthAttendance.length,
      attendancePercentage,
      totalWorkoutLogs: workoutLogs.length,
      totalWorkoutPlans: workoutPlans.length,
      activeGoalsCount: activeGoals.length,
      achievedGoalsCount: achievedGoals.length,
      activeGoals,
      achievedGoals,
      weightHistory,
      profile,
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error computing progress dashboard.' });
  }
}
