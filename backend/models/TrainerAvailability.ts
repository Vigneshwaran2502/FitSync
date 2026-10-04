import mongoose, { Document, Schema } from 'mongoose';

export interface ITrainerAvailability extends Document {
  _id: mongoose.Types.ObjectId;
  trainerId: mongoose.Types.ObjectId; // User ID with role 'trainer'
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  startTime: string; // e.g. "09:00"
  endTime: string;   // e.g. "17:00"
  slotDurationMinutes: number;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TrainerAvailabilitySchema = new Schema<ITrainerAvailability>(
  {
    trainerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    dayOfWeek: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: true,
    },
    startTime: {
      type: String,
      required: true,
      default: '09:00',
    },
    endTime: {
      type: String,
      required: true,
      default: '17:00',
    },
    slotDurationMinutes: {
      type: Number,
      default: 60,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Unique compound index per trainer and day of week
TrainerAvailabilitySchema.index({ trainerId: 1, dayOfWeek: 1 }, { unique: true });

export const TrainerAvailability =
  mongoose.models.TrainerAvailability ||
  mongoose.model<ITrainerAvailability>('TrainerAvailability', TrainerAvailabilitySchema);
