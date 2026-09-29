const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  attendanceDate: { type: Date, required: true },
  checkInTime: { type: Date, required: true },
  checkOutTime: { type: Date },
  status: { type: String, enum: ['present', 'rejected', 'cancelled'], default: 'present' },
  verificationMethod: { type: String, enum: ['qr_location', 'admin', 'trainer'] },
  latitude: { type: Number },
  longitude: { type: Number },
  distanceFromGym: { type: Number },
  qrSessionId: { type: String },
  notes: { type: String }
}, { timestamps: true });

// Ensure one attendance per member per day
attendanceSchema.index({ memberId: 1, attendanceDate: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
