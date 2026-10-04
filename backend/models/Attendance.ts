import mongoose, { Document, Schema } from 'mongoose';

export interface IAttendance extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  date: string; // "YYYY-MM-DD"
  checkInTime: string; // ISO or "HH:mm"
  checkOutTime?: string;
  status: 'present' | 'checked_out';
  verificationMethod: 'qr' | 'gps' | 'manual';
  latitude?: number;
  longitude?: number;
  distanceMeters?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema = new Schema<IAttendance>(
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
    checkInTime: {
      type: String,
      required: true,
    },
    checkOutTime: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['present', 'checked_out'],
      default: 'present',
    },
    verificationMethod: {
      type: String,
      enum: ['qr', 'gps', 'manual'],
      default: 'qr',
    },
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    },
    distanceMeters: {
      type: Number,
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

// Prevent duplicate check-in on the same date unless already checked out or admin creates
AttendanceSchema.index({ userId: 1, date: 1 });

export const Attendance =
  mongoose.models.Attendance || mongoose.model<IAttendance>('Attendance', AttendanceSchema);
