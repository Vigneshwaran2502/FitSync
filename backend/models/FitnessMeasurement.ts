import mongoose, { Document, Schema } from 'mongoose';

export interface IFitnessMeasurement extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  date: string; // "YYYY-MM-DD"
  weightKg: number;
  chestCm?: number;
  waistCm?: number;
  hipsCm?: number;
  armsCm?: number;
  thighsCm?: number;
  bodyFatPercent?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FitnessMeasurementSchema = new Schema<IFitnessMeasurement>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    weightKg: {
      type: Number,
      required: true,
      min: 20,
      max: 300,
    },
    chestCm: {
      type: Number,
    },
    waistCm: {
      type: Number,
    },
    hipsCm: {
      type: Number,
    },
    armsCm: {
      type: Number,
    },
    thighsCm: {
      type: Number,
    },
    bodyFatPercent: {
      type: Number,
      min: 3,
      max: 60,
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

FitnessMeasurementSchema.index({ userId: 1, date: -1 });

export const FitnessMeasurement =
  mongoose.models.FitnessMeasurement ||
  mongoose.model<IFitnessMeasurement>('FitnessMeasurement', FitnessMeasurementSchema);
