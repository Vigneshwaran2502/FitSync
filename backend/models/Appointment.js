import mongoose, { Schema } from "mongoose";
const AppointmentSchema = new Schema(
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
    date: {
      type: String,
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
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed", "rejected"],
      default: "pending"
    },
    topic: {
      type: String,
      default: "Personal Training Session"
    },
    notes: {
      type: String,
      default: ""
    },
    rejectionReason: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);
const Appointment = mongoose.models.Appointment || mongoose.model("Appointment", AppointmentSchema);
export {
  Appointment
};
