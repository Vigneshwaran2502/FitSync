const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  muscleGroup: { type: String },
  equipment: { type: String },
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
  instructions: { type: String },
  videoUrl: { type: String },
  imageUrl: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Exercise', exerciseSchema);
