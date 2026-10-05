import mongoose, { Schema } from "mongoose";
const SubscriptionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    planId: {
      type: Schema.Types.ObjectId,
      ref: "MembershipPlan",
      required: true
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now
    },
    endDate: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ["active", "expired", "frozen", "pending", "cancelled"],
      default: "active"
    },
    freezeRequested: {
      type: Boolean,
      default: false
    },
    freezeReason: {
      type: String,
      default: ""
    },
    freezeStartDate: {
      type: Date
    },
    freezeEndDate: {
      type: Date
    },
    paymentStatus: {
      type: String,
      enum: ["paid", "pending", "failed"],
      default: "paid"
    },
    paymentAmount: {
      type: Number,
      required: true
    },
    paymentDate: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);
const Subscription = mongoose.models.Subscription || mongoose.model("Subscription", SubscriptionSchema);
export {
  Subscription
};
