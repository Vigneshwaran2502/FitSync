import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { Exercise } from '../models/Exercise.js';

export async function getExercises(req: AuthRequest, res: Response) {
  try {
    const { muscleGroup, equipment, difficulty, search } = req.query;
    const query: any = {};

    if (muscleGroup) query.muscleGroup = muscleGroup;
    if (equipment) query.equipment = equipment;
    if (difficulty) query.difficulty = difficulty;
    if (search) {
      query.name = { $regex: String(search), $options: 'i' };
    }

    const exercises = await Exercise.find(query).sort({ muscleGroup: 1, name: 1 });
    res.json({ exercises });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error fetching exercises.' });
  }
}

export async function getExerciseById(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const exercise = await Exercise.findById(id);
    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found.' });
    }
    res.json({ exercise });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error fetching exercise.' });
  }
}

export async function createExercise(req: AuthRequest, res: Response) {
  try {
    const { name, muscleGroup, equipment, difficulty, instructions, videoUrl } = req.body;

    if (!name || !muscleGroup) {
      return res.status(400).json({ message: 'Name and muscle group are required.' });
    }

    const existing = await Exercise.findOne({ name: name.trim() });
    if (existing) {
      return res.status(409).json({ message: 'An exercise with this name already exists.' });
    }

    const exercise = await Exercise.create({
      name: name.trim(),
      muscleGroup,
      equipment: equipment || 'Barbell',
      difficulty: difficulty || 'Intermediate',
      instructions: instructions || '',
      videoUrl: videoUrl || '',
      isCustom: true,
      createdBy: req.user?._id,
    });

    res.status(201).json({ message: 'Exercise added to library.', exercise });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error creating exercise.' });
  }
}

export async function updateExercise(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { name, muscleGroup, equipment, difficulty, instructions, videoUrl } = req.body;

    const exercise = await Exercise.findById(id);
    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found.' });
    }

    if (name) exercise.name = name.trim();
    if (muscleGroup) exercise.muscleGroup = muscleGroup;
    if (equipment) exercise.equipment = equipment;
    if (difficulty) exercise.difficulty = difficulty;
    if (instructions !== undefined) exercise.instructions = instructions;
    if (videoUrl !== undefined) exercise.videoUrl = videoUrl;

    await exercise.save();
    res.json({ message: 'Exercise updated.', exercise });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error updating exercise.' });
  }
}

export async function deleteExercise(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const exercise = await Exercise.findById(id);
    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found.' });
    }

    await Exercise.findByIdAndDelete(id);
    res.json({ message: 'Exercise deleted successfully.' });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Error deleting exercise.' });
  }
}
