import mongoose, { Document, Schema } from 'mongoose';

export interface IFitnessGoal extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  category: 'Weight' | 'Strength' | 'Endurance' | 'Attendance' | 'Habit';
  targetValue: number;
  currentValue: number;
  unit: string; // e.g. "kg", "sessions", "reps", "km"
  targetDate: string; // "YYYY-MM-DD"
  status: 'active' | 'achieved' | 'abandoned';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FitnessGoalSchema = new Schema<IFitnessGoal>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Goal title is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['Weight', 'Strength', 'Endurance', 'Attendance', 'Habit'],
      default: 'Weight',
    },
    targetValue: {
      type: Number,
      required: true,
    },
    currentValue: {
      type: Number,
      default: 0,
    },
    unit: {
      type: String,
      default: 'kg',
    },
    targetDate: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'achieved', 'abandoned'],
      default: 'active',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const FitnessGoal =
  mongoose.models.FitnessGoal || mongoose.model<IFitnessGoal>('FitnessGoal', FitnessGoalSchema);
