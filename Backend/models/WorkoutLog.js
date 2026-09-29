const mongoose = require('mongoose');

const workoutLogSchema = new mongoose.Schema({
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  workoutPlanId: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkoutPlan', required: true },
  workoutPlanExerciseId: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkoutPlanExercise', required: true },
  performedDate: { type: Date, required: true },
  setsCompleted: { type: Number },
  repsCompleted: { type: Number },
  weightUsed: { type: Number },
  durationMinutes: { type: Number },
  caloriesBurned: { type: Number },
  difficultyRating: { type: Number, min: 1, max: 10 },
  notes: { type: String },
  completed: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('WorkoutLog', workoutLogSchema);
