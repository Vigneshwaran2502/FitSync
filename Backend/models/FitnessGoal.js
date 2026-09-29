const mongoose = require('mongoose');

const fitnessGoalSchema = new mongoose.Schema({
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  goalType: { 
    type: String, 
    enum: ['weight_loss', 'muscle_gain', 'strength', 'endurance', 'attendance', 'workout_completion'] 
  },
  title: { type: String },
  description: { type: String },
  startValue: { type: Number },
  targetValue: { type: Number },
  currentValue: { type: Number },
  unit: { type: String },
  startDate: { type: Date },
  targetDate: { type: Date },
  status: { type: String, enum: ['active', 'achieved', 'paused', 'cancelled'], default: 'active' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('FitnessGoal', fitnessGoalSchema);
