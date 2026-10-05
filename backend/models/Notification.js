import mongoose, { Schema } from "mongoose";
const NotificationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ["workout", "goal", "attendance", "subscription", "announcement", "appointment", "system"],
      default: "system"
    },
    isRead: {
      type: Boolean,
      default: false
    },
    actionUrl: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);
NotificationSchema.index({ userId: 1, isRead: 1 });
const Notification = mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);
export {
  Notification
};
