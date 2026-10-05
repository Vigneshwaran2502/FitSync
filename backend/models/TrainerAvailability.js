import mongoose, { Schema } from "mongoose";
const TrainerAvailabilitySchema = new Schema(
  {
    trainerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    dayOfWeek: {
      type: String,
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      required: true
    },
    startTime: {
      type: String,
      required: true,
      default: "09:00"
    },
    endTime: {
      type: String,
      required: true,
      default: "17:00"
    },
    slotDurationMinutes: {
      type: Number,
      default: 60
    },
    isAvailable: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);
TrainerAvailabilitySchema.index({ trainerId: 1, dayOfWeek: 1 }, { unique: true });
const TrainerAvailability = mongoose.models.TrainerAvailability || mongoose.model("TrainerAvailability", TrainerAvailabilitySchema);
export {
  TrainerAvailability
};
