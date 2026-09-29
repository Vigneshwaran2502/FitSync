const mongoose = require('mongoose');

const workoutPlanSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String },
  trainerId: { type: mongoose.Schema.Types.ObjectId, ref: 'TrainerProfile', required: true },
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  goal: { type: String },
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
  durationWeeks: { type: Number, required: true, min: 1 },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, enum: ['active', 'completed', 'paused', 'cancelled'], default: 'active' },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('WorkoutPlan', workoutPlanSchema);
