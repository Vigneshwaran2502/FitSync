import mongoose, { Schema } from "mongoose";
const WorkoutLogSchema = new Schema(
  {
    memberId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    workoutPlanId: {
      type: Schema.Types.ObjectId,
      ref: "WorkoutPlan"
    },
    exerciseId: {
      type: Schema.Types.ObjectId,
      ref: "Exercise",
      required: true
    },
    date: {
      type: String,
      required: true
    },
    setsCompleted: {
      type: Number,
      required: true,
      min: 1
    },
    repsCompleted: {
      type: Number,
      required: true,
      min: 1
    },
    weightUsedKg: {
      type: Number,
      default: 0,
      min: 0
    },
    difficultyRating: {
      type: Number,
      default: 3,
      min: 1,
      max: 5
    },
    notes: {
      type: String,
      default: ""
    },
    durationMinutes: {
      type: Number,
      default: 45
    }
  },
  {
    timestamps: true
  }
);
const WorkoutLog = mongoose.models.WorkoutLog || mongoose.model("WorkoutLog", WorkoutLogSchema);
export {
  WorkoutLog
};
