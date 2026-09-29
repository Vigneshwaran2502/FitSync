const mongoose = require('mongoose');

const progressMeasurementSchema = new mongoose.Schema({
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recordedDate: { type: Date, required: true },
  weightKg: { type: Number, min: 0 },
  bodyFatPercentage: { type: Number, min: 0, max: 100 },
  chestCm: { type: Number, min: 0 },
  waistCm: { type: Number, min: 0 },
  hipCm: { type: Number, min: 0 },
  armCm: { type: Number, min: 0 },
  thighCm: { type: Number, min: 0 },
  notes: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('ProgressMeasurement', progressMeasurementSchema);
