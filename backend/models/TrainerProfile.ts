import mongoose, { Document, Schema } from 'mongoose';

export interface ITrainerProfile extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  specialization: string[];
  experienceYears: number;
  bio: string;
  certifications: string[];
  isAvailable: boolean;
  hourlyRate?: number;
  rating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const TrainerProfileSchema = new Schema<ITrainerProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    specialization: {
      type: [String],
      default: ['General Fitness', 'Strength Training'],
    },
    experienceYears: {
      type: Number,
      default: 2,
      min: 0,
    },
    bio: {
      type: String,
      default: '',
    },
    certifications: {
      type: [String],
      default: [],
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    hourlyRate: {
      type: Number,
      default: 50,
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 1,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

export const TrainerProfile =
  mongoose.models.TrainerProfile || mongoose.model<ITrainerProfile>('TrainerProfile', TrainerProfileSchema);
