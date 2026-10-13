import mongoose, { Schema } from "mongoose";
const SubscriptionSchema = new Schema(
  {
    member: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    membershipPlan: {
      type: Schema.Types.ObjectId,
      ref: "MembershipPlan"
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
    currentEndDate: {
      type: Date
    },
    originalEndDate: {
      type: Date
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
    pricePaid: {
      type: Number
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
