const mongoose = require('mongoose');

const trainerAvailabilitySchema = new mongoose.Schema({
  trainerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'TrainerProfile', 
    required: true 
  },
  dayOfWeek: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true
  },
  startTime: { 
    type: String, 
    required: true 
  },
  endTime: { 
    type: String, 
    required: true 
  },
  isAvailable: { 
    type: Boolean, 
    default: true 
  }
}, { timestamps: true });

module.exports = mongoose.model('TrainerAvailability', trainerAvailabilitySchema);
