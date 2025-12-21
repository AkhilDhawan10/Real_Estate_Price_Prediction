import mongoose, { Document, Schema } from 'mongoose';

export type PlanType = 'monthly' | 'quarterly';

export interface ISubscription extends Document {
  user: mongoose.Types.ObjectId;
  planType: PlanType;
  paymentId: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  amount: number;
  startDate: Date;
  expiryDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    planType: {
      type: String,
      enum: ['monthly', 'quarterly'],
      required: true,
    },
    paymentId: {
      type: String,
      required: true,
      unique: true,
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    amount: {
      type: Number,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
SubscriptionSchema.index({ user: 1 });
SubscriptionSchema.index({ expiryDate: 1 });
SubscriptionSchema.index({ isActive: 1 });

// Virtual to check if subscription is expired
SubscriptionSchema.virtual('isExpired').get(function () {
  return new Date() > this.expiryDate;
});

export default mongoose.model<ISubscription>('Subscription', SubscriptionSchema);

