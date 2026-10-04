import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { WorkoutPlan } from '../models/WorkoutPlan.js';
import { WorkoutLog } from '../models/WorkoutLog.js';
import { Notification } from '../models/Notification.js';

export async function getWorkoutPlans(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated.' });

    const query: any = {};
    if (req.user.role === 'member') {
      query.memberId = req.user._id;
    } else if (req.user.role === 'trainer') {
      query.trainerId = req.user._id;
    }

    const plans = await WorkoutPlan.find(query)
      .populate('memberId', 'name email')
      .populate('trainerId', 'name email')
      .populate('exercises.exerciseId')
      .sort({ createdAt: -1 });

    res.json({ plans });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error fetching workout plans.' });
  }
}

export async function getWorkoutPlanById(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const plan = await WorkoutPlan.findById(id)
      .populate('memberId', 'name email phone')
      .populate('trainerId', 'name email phone')
      .populate('exercises.exerciseId');

    if (!plan) {
      return res.status(404).json({ message: 'Workout plan not found.' });
    }

    res.json({ plan });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error fetching workout plan.' });
  }
}

export async function createWorkoutPlan(req: AuthRequest, res: Response) {
  try {
    if (!req.user || (req.user.role !== 'trainer' && req.user.role !== 'admin')) {
      return res.status(403).json({ message: 'Only trainers or admins can create workout plans.' });
    }

    const { memberId, name, goal, difficulty, durationWeeks, startDate, notes, exercises } = req.body;

    if (!memberId || !name || !goal) {
      return res.status(400).json({ message: 'Member, plan name, and goal are required.' });
    }

    const plan = await WorkoutPlan.create({
      memberId,
      trainerId: req.user._id,
      name: name.trim(),
      goal: goal.trim(),
      difficulty: difficulty || 'Intermediate',
      durationWeeks: Number(durationWeeks) || 4,
      startDate: startDate ? new Date(startDate) : new Date(),
      notes: notes || '',
      exercises: Array.isArray(exercises) ? exercises : [],
      status: 'active',
    });

    // Notify member about new workout plan
    await Notification.create({
      userId: memberId,
      title: 'New Workout Plan Assigned',
      message: `Coach ${req.user.name} has assigned you the '${name}' workout routine.`,
      type: 'workout',
      actionUrl: '/member/workouts',
    });

    const populated = await WorkoutPlan.findById(plan._id)
      .populate('memberId', 'name email')
      .populate('trainerId', 'name email')
      .populate('exercises.exerciseId');

    res.status(201).json({ message: 'Workout plan created successfully.', plan: populated });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error creating workout plan.' });
  }
}

export async function updateWorkoutPlan(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { name, goal, difficulty, durationWeeks, status, notes, exercises } = req.body;

    const plan = await WorkoutPlan.findById(id);
    if (!plan) {
      return res.status(404).json({ message: 'Workout plan not found.' });
    }

    if (name) plan.name = name.trim();
    if (goal) plan.goal = goal.trim();
    if (difficulty) plan.difficulty = difficulty;
    if (durationWeeks !== undefined) plan.durationWeeks = Number(durationWeeks);
    if (status) plan.status = status;
    if (notes !== undefined) plan.notes = notes;
    if (Array.isArray(exercises)) plan.exercises = exercises;

    await plan.save();

    const populated = await WorkoutPlan.findById(plan._id)
      .populate('memberId', 'name email')
      .populate('trainerId', 'name email')
      .populate('exercises.exerciseId');

    res.json({ message: 'Workout plan updated.', plan: populated });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error updating workout plan.' });
  }
}

export async function deleteWorkoutPlan(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const plan = await WorkoutPlan.findById(id);
    if (!plan) {
      return res.status(404).json({ message: 'Workout plan not found.' });
    }

    plan.status = 'archived';
    await plan.save();

    res.json({ message: 'Workout plan archived.' });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error archiving workout plan.' });
  }
}

export async function getTodayWorkout(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated.' });

    const memberId = req.user.role === 'member' ? req.user._id : req.query.memberId;
    if (!memberId) return res.status(400).json({ message: 'Member ID required.' });

    const activePlan = await WorkoutPlan.findOne({
      memberId,
      status: 'active',
    })
      .populate('trainerId', 'name')
      .populate('exercises.exerciseId');

    if (!activePlan) {
      return res.json({ todayExercises: [], plan: null, dayOfWeek: '' });
    }

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = dayNames[new Date().getDay()];

    const todayExercises = activePlan.exercises.filter((ex: any) => ex.dayOfWeek === currentDay);

    res.json({
      plan: activePlan,
      dayOfWeek: currentDay,
      todayExercises,
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Error fetching today's workout." });
  }
}

export async function logWorkout(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated.' });

    const { exerciseId, workoutPlanId, date, setsCompleted, repsCompleted, weightUsedKg, difficultyRating, notes, durationMinutes } = req.body;

    if (!exerciseId || setsCompleted === undefined || repsCompleted === undefined) {
      return res.status(400).json({ message: 'Exercise, sets completed, and reps completed are required.' });
    }

    const log = await WorkoutLog.create({
      memberId: req.user._id,
      workoutPlanId,
      exerciseId,
      date: date || new Date().toISOString().split('T')[0],
      setsCompleted: Number(setsCompleted),
      repsCompleted: Number(repsCompleted),
      weightUsedKg: Number(weightUsedKg) || 0,
      difficultyRating: Number(difficultyRating) || 3,
      notes: notes || '',
      durationMinutes: Number(durationMinutes) || 45,
    });

    const populated = await WorkoutLog.findById(log._id).populate('exerciseId');

    res.status(201).json({ message: 'Workout logged successfully!', log: populated });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error logging workout.' });
  }
}

export async function getWorkoutLogs(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated.' });

    const query: any = {};
    if (req.user.role === 'member') {
      query.memberId = req.user._id;
    } else if (req.query.memberId) {
      query.memberId = req.query.memberId;
    }

    if (req.query.date) query.date = req.query.date;

    const logs = await WorkoutLog.find(query)
      .populate('exerciseId')
      .populate('memberId', 'name email')
      .sort({ date: -1, createdAt: -1 });

    res.json({ logs });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error fetching workout logs.' });
  }
}
