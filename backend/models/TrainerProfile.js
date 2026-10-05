import mongoose, { Schema } from "mongoose";
const TrainerProfileSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    specialization: {
      type: [String],
      default: ["General Fitness", "Strength Training"]
    },
    experienceYears: {
      type: Number,
      default: 2,
      min: 0
    },
    bio: {
      type: String,
      default: ""
    },
    certifications: {
      type: [String],
      default: []
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    hourlyRate: {
      type: Number,
      default: 50
    },
    rating: {
      type: Number,
      default: 5,
      min: 1,
      max: 5
    },
    reviewCount: {
      type: Number,
      default: 1
    }
  },
  {
    timestamps: true
  }
);
const TrainerProfile = mongoose.models.TrainerProfile || mongoose.model("TrainerProfile", TrainerProfileSchema);
export {
  TrainerProfile
};
