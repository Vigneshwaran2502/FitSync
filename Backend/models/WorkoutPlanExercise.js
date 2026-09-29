const mongoose = require('mongoose');

const workoutPlanExerciseSchema = new mongoose.Schema({
  workoutPlanId: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkoutPlan', required: true },
  exerciseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise', required: true },
  dayNumber: { type: Number, required: true },
  dayName: { type: String },
  sets: { type: Number },
  reps: { type: Number },
  targetWeight: { type: Number },
  durationMinutes: { type: Number },
  restSeconds: { type: Number },
  order: { type: Number, default: 1 },
  notes: { type: String },
  completed: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('WorkoutPlanExercise', workoutPlanExerciseSchema);
