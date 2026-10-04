import mongoose, { Document, Schema } from 'mongoose';

export interface ISubscription extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  planId: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'expired' | 'frozen' | 'pending' | 'cancelled';
  freezeRequested?: boolean;
  freezeReason?: string;
  freezeStartDate?: Date;
  freezeEndDate?: Date;
  paymentStatus: 'paid' | 'pending' | 'failed';
  paymentAmount: number;
  paymentDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    planId: {
      type: Schema.Types.ObjectId,
      ref: 'MembershipPlan',
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'frozen', 'pending', 'cancelled'],
      default: 'active',
    },
    freezeRequested: {
      type: Boolean,
      default: false,
    },
    freezeReason: {
      type: String,
      default: '',
    },
    freezeStartDate: {
      type: Date,
    },
    freezeEndDate: {
      type: Date,
    },
    paymentStatus: {
      type: String,
      enum: ['paid', 'pending', 'failed'],
      default: 'paid',
    },
    paymentAmount: {
      type: Number,
      required: true,
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const Subscription =
  mongoose.models.Subscription || mongoose.model<ISubscription>('Subscription', SubscriptionSchema);
