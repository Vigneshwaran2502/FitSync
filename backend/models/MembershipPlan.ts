import mongoose, { Document, Schema } from 'mongoose';

export interface IMembershipPlan extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description: string;
  durationMonths: number;
  price: number;
  features: string[];
  isActive: boolean;
  tier: 'basic' | 'standard' | 'premium' | 'vip';
  createdAt: Date;
  updatedAt: Date;
}

const MembershipPlanSchema = new Schema<IMembershipPlan>(
  {
    name: {
      type: String,
      required: [true, 'Plan name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    durationMonths: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    features: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    tier: {
      type: String,
      enum: ['basic', 'standard', 'premium', 'vip'],
      default: 'standard',
    },
  },
  {
    timestamps: true,
  }
);

export const MembershipPlan =
  mongoose.models.MembershipPlan || mongoose.model<IMembershipPlan>('MembershipPlan', MembershipPlanSchema);
