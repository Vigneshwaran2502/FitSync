const mongoose = require('mongoose');

const attendanceQRSessionSchema = new mongoose.Schema({
  sessionId: { type: String, unique: true, required: true },
  expiresAt: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('AttendanceQRSession', attendanceQRSessionSchema);
