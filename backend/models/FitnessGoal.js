import mongoose, { Schema } from "mongoose";
const FitnessGoalSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    title: {
      type: String,
      required: [true, "Goal title is required"],
      trim: true
    },
    category: {
      type: String,
      enum: ["Weight", "Strength", "Endurance", "Attendance", "Habit"],
      default: "Weight"
    },
    targetValue: {
      type: Number,
      required: true
    },
    currentValue: {
      type: Number,
      default: 0
    },
    unit: {
      type: String,
      default: "kg"
    },
    targetDate: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ["active", "achieved", "abandoned"],
      default: "active"
    },
    notes: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);
const FitnessGoal = mongoose.models.FitnessGoal || mongoose.model("FitnessGoal", FitnessGoalSchema);
export {
  FitnessGoal
};
