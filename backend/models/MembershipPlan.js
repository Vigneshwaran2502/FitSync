import mongoose, { Schema } from "mongoose";
const MembershipPlanSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Plan name is required"],
      trim: true
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true
    },
    durationMonths: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    features: {
      type: [String],
      default: []
    },
    isActive: {
      type: Boolean,
      default: true
    },
    tier: {
      type: String,
      enum: ["basic", "standard", "premium", "vip"],
      default: "standard"
    }
  },
  {
    timestamps: true
  }
);
const MembershipPlan = mongoose.models.MembershipPlan || mongoose.model("MembershipPlan", MembershipPlanSchema);
export {
  MembershipPlan
};
