import mongoose, { Document, Schema } from 'mongoose';

export interface IWorkoutLog extends Document {
  _id: mongoose.Types.ObjectId;
  memberId: mongoose.Types.ObjectId;
  workoutPlanId?: mongoose.Types.ObjectId;
  exerciseId: mongoose.Types.ObjectId;
  date: string; // "YYYY-MM-DD"
  setsCompleted: number;
  repsCompleted: number;
  weightUsedKg: number;
  difficultyRating: number; // 1 to 5 (RPE / perceived difficulty)
  notes?: string;
  durationMinutes?: number;
  createdAt: Date;
  updatedAt: Date;
}

const WorkoutLogSchema = new Schema<IWorkoutLog>(
  {
    memberId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    workoutPlanId: {
      type: Schema.Types.ObjectId,
      ref: 'WorkoutPlan',
    },
    exerciseId: {
      type: Schema.Types.ObjectId,
      ref: 'Exercise',
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    setsCompleted: {
      type: Number,
      required: true,
      min: 1,
    },
    repsCompleted: {
      type: Number,
      required: true,
      min: 1,
    },
    weightUsedKg: {
      type: Number,
      default: 0,
      min: 0,
    },
    difficultyRating: {
      type: Number,
      default: 3,
      min: 1,
      max: 5,
    },
    notes: {
      type: String,
      default: '',
    },
    durationMinutes: {
      type: Number,
      default: 45,
    },
  },
  {
    timestamps: true,
  }
);

export const WorkoutLog =
  mongoose.models.WorkoutLog || mongoose.model<IWorkoutLog>('WorkoutLog', WorkoutLogSchema);
