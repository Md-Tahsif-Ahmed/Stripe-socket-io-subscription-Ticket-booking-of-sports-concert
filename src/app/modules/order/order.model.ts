import { Schema, model, Types } from "mongoose";
import { IOrder, ORDER_STATUS } from "./order.interface";

const orderSchema = new Schema<IOrder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },

    transactionId: {
      type: Schema.Types.ObjectId,
      ref: "Transaction",
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
      max: 6,
    },

    ticketType: {
      type: String,
      required: true,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PENDING,
      index: true,
    },

    contact: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      countryCode: { type: String, required: true },
      phone: { type: String, required: true },
    },

    address: {
      line1: { type: String, required: true },
      line2: { type: String },
      city: { type: String, required: true },
      zip: { type: String, required: true },
      country: { type: String, required: true },
    },

    paymentIntentId: {
      type: String,
      index: true,
    },

    isCancelled: {
      type: Boolean,
      default: false,
    },

    cancelledAt: {
      type: Date,
    },

    payoutProcessed: {
      type: Boolean,
      default: false,
      index: true,
    },

    payoutAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Optimized Compound Indexes
 * Frequent queries:
 * - Event wise orders
 * - Status based filtering
 * - Payout pending orders
 */
orderSchema.index({ eventId: 1, status: 1 });
orderSchema.index({ payoutProcessed: 1, status: 1 });

export const OrderModel = model<IOrder>("Order", orderSchema);
