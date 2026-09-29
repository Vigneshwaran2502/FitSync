const mongoose = require('mongoose');

const fitnessProfileSchema = new mongoose.Schema({
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  dateOfBirth: { type: Date },
  gender: { type: String },
  heightCm: { type: Number, min: 0 },
  currentWeightKg: { type: Number, min: 0 },
  fitnessGoal: { 
    type: String, 
    enum: ['weight_loss', 'muscle_gain', 'strength', 'endurance', 'general_fitness'] 
  },
  activityLevel: { 
    type: String, 
    enum: ['sedentary', 'lightly_active', 'moderately_active', 'very_active'] 
  },
  targetWeightKg: { type: Number, min: 0 }
}, { timestamps: true });

module.exports = mongoose.model('FitnessProfile', fitnessProfileSchema);
