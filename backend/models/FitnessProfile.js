import mongoose, { Schema } from "mongoose";
const FitnessProfileSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    heightCm: {
      type: Number,
      required: true,
      default: 175
    },
    currentWeightKg: {
      type: Number,
      required: true,
      default: 75
    },
    targetWeightKg: {
      type: Number,
      required: true,
      default: 70
    },
    dateOfBirth: {
      type: String,
      default: "1995-01-01"
    },
    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer_not_to_say"],
      default: "male"
    },
    fitnessGoal: {
      type: String,
      enum: ["Weight Loss", "Muscle Gain", "Endurance", "Maintenance", "Flexibility", "General Health"],
      default: "General Health"
    },
    fitnessLevel: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner"
    },
    medicalConditions: {
      type: String,
      default: ""
    },
    assignedTrainerId: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },
    onboardingCompleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);
FitnessProfileSchema.virtual("bmi").get(function() {
  if (!this.heightCm || !this.currentWeightKg) return 0;
  const heightInMeters = this.heightCm / 100;
  return Number((this.currentWeightKg / (heightInMeters * heightInMeters)).toFixed(1));
});
const FitnessProfile = mongoose.models.FitnessProfile || mongoose.model("FitnessProfile", FitnessProfileSchema);
export {
  FitnessProfile
};
