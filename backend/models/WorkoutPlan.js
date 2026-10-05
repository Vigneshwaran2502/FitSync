import mongoose, { Schema } from "mongoose";
const WorkoutPlanExerciseSchema = new Schema({
  exerciseId: {
    type: Schema.Types.ObjectId,
    ref: "Exercise",
    required: true
  },
  dayOfWeek: {
    type: String,
    enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    required: true
  },
  sets: {
    type: Number,
    required: true,
    min: 1,
    default: 3
  },
  reps: {
    type: Number,
    required: true,
    min: 1,
    default: 10
  },
  targetWeightKg: {
    type: Number,
    default: 0
  },
  restSeconds: {
    type: Number,
    default: 60
  },
  notes: {
    type: String,
    default: ""
  },
  order: {
    type: Number,
    default: 0
  }
});
const WorkoutPlanSchema = new Schema(
  {
    memberId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    trainerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    name: {
      type: String,
      required: [true, "Plan name is required"],
      trim: true
    },
    goal: {
      type: String,
      required: [true, "Plan goal is required"],
      trim: true
    },
    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Intermediate"
    },
    durationWeeks: {
      type: Number,
      required: true,
      min: 1,
      default: 4
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ["active", "completed", "archived"],
      default: "active"
    },
    notes: {
      type: String,
      default: ""
    },
    exercises: [WorkoutPlanExerciseSchema]
  },
  {
    timestamps: true
  }
);
const WorkoutPlan = mongoose.models.WorkoutPlan || mongoose.model("WorkoutPlan", WorkoutPlanSchema);
export {
  WorkoutPlan
};
