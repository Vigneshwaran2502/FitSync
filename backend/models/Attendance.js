import mongoose, { Schema } from "mongoose";
const AttendanceSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    date: {
      type: String,
      required: true
    },
    checkInTime: {
      type: String,
      required: true
    },
    checkOutTime: {
      type: String,
      default: ""
    },
    status: {
      type: String,
      enum: ["present", "checked_out"],
      default: "present"
    },
    verificationMethod: {
      type: String,
      enum: ["qr", "gps", "manual"],
      default: "qr"
    },
    latitude: {
      type: Number
    },
    longitude: {
      type: Number
    },
    distanceMeters: {
      type: Number
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
AttendanceSchema.index({ userId: 1, date: 1 });
const Attendance = mongoose.models.Attendance || mongoose.model("Attendance", AttendanceSchema);
export {
  Attendance
};
