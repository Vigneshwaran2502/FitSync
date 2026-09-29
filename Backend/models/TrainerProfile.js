const mongoose = require('mongoose');

const trainerProfileSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    unique: true 
  },
  specialization: { 
    type: String, 
    required: true 
  },
  experienceYears: { 
    type: Number, 
    min: 0 
  },
  certifications: { 
    type: [String], 
    default: [] 
  },
  bio: { type: String },
  sessionDuration: { 
    type: Number, 
    default: 60 
  },
  sessionPrice: { 
    type: Number, 
    min: 0 
  },
  profileImage: { type: String },
  isAvailable: { 
    type: Boolean, 
    default: true 
  }
}, { timestamps: true });

module.exports = mongoose.model('TrainerProfile', trainerProfileSchema);
