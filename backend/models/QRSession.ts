import mongoose, { Document, Schema } from 'mongoose';

export interface IQRSession extends Document {
  _id: mongoose.Types.ObjectId;
  code: string;
  isActive: boolean;
  expiresAt: Date;
  gymLatitude: number;
  gymLongitude: number;
  maxRadiusMeters: number;
  createdAt: Date;
  updatedAt: Date;
}

const QRSessionSchema = new Schema<IQRSession>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    gymLatitude: {
      type: Number,
      required: true,
    },
    gymLongitude: {
      type: Number,
      required: true,
    },
    maxRadiusMeters: {
      type: Number,
      default: 1000,
    },
  },
  {
    timestamps: true,
  }
);

export const QRSession =
  mongoose.models.QRSession || mongoose.model<IQRSession>('QRSession', QRSessionSchema);
