import mongoose, { Schema } from "mongoose";
const ExerciseSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Exercise name is required"],
      trim: true,
      unique: true
    },
    muscleGroup: {
      type: String,
      enum: ["Chest", "Back", "Legs", "Shoulders", "Arms", "Core", "Cardio", "Full Body"],
      required: true
    },
    equipment: {
      type: String,
      enum: ["Barbell", "Dumbbell", "Machine", "Cable", "Bodyweight", "Kettlebell", "Bands", "Other"],
      default: "Barbell"
    },
    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Intermediate"
    },
    instructions: {
      type: String,
      default: ""
    },
    videoUrl: {
      type: String,
      default: ""
    },
    isCustom: {
      type: Boolean,
      default: false
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User"
    }
  },
  {
    timestamps: true
  }
);
const Exercise = mongoose.models.Exercise || mongoose.model("Exercise", ExerciseSchema);
export {
  Exercise
};
