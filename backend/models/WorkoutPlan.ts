import mongoose, { Document, Schema } from 'mongoose';

export interface IWorkoutPlanExercise {
  _id?: mongoose.Types.ObjectId;
  exerciseId: mongoose.Types.ObjectId;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  sets: number;
  reps: number;
  targetWeightKg?: number;
  restSeconds: number;
  notes?: string;
  order: number;
}

export interface IWorkoutPlan extends Document {
  _id: mongoose.Types.ObjectId;
  memberId: mongoose.Types.ObjectId;
  trainerId: mongoose.Types.ObjectId;
  name: string;
  goal: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  durationWeeks: number;
  startDate: Date;
  status: 'active' | 'completed' | 'archived';
  notes?: string;
  exercises: IWorkoutPlanExercise[];
  createdAt: Date;
  updatedAt: Date;
}

const WorkoutPlanExerciseSchema = new Schema<IWorkoutPlanExercise>({
  exerciseId: {
    type: Schema.Types.ObjectId,
    ref: 'Exercise',
    required: true,
  },
  dayOfWeek: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true,
  },
  sets: {
    type: Number,
    required: true,
    min: 1,
    default: 3,
  },
  reps: {
    type: Number,
    required: true,
    min: 1,
    default: 10,
  },
  targetWeightKg: {
    type: Number,
    default: 0,
  },
  restSeconds: {
    type: Number,
    default: 60,
  },
  notes: {
    type: String,
    default: '',
  },
  order: {
    type: Number,
    default: 0,
  },
});

const WorkoutPlanSchema = new Schema<IWorkoutPlan>(
  {
    memberId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    trainerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Plan name is required'],
      trim: true,
    },
    goal: {
      type: String,
      required: [true, 'Plan goal is required'],
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Intermediate',
    },
    durationWeeks: {
      type: Number,
      required: true,
      min: 1,
      default: 4,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'archived'],
      default: 'active',
    },
    notes: {
      type: String,
      default: '',
    },
    exercises: [WorkoutPlanExerciseSchema],
  },
  {
    timestamps: true,
  }
);

export const WorkoutPlan =
  mongoose.models.WorkoutPlan || mongoose.model<IWorkoutPlan>('WorkoutPlan', WorkoutPlanSchema);
