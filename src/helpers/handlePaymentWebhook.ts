import Stripe from "stripe";
import mongoose from "mongoose";
import config from "../config";
import { OrderModel } from "../app/modules/order/order.model";
import { ORDER_STATUS } from "../app/modules/order/order.interface";
import { EventModel } from "../app/modules/event/event.model";
import Transaction, { RefundStatus, TransactionStatus } from "../app/modules/payment/transaction.model";

const handlePaymentWebhook = async (rawBody: Buffer, sig: string) => {
  const event = Stripe.webhooks.constructEvent(
    rawBody,
    sig,
    config.stripe.webhookSecret!
  );

  // ================= PAYMENT SUCCESS =================
  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object as Stripe.PaymentIntent;
    const orderId = intent.metadata?.orderId;
    if (!orderId) return;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1️⃣ Idempotency guard
      // Only pick order if it is still PENDING and not processed before
      const order = await OrderModel.findOne({
        _id: orderId,
        status: ORDER_STATUS.PAYMENT_INITIATED,
        paymentProcessed: false,
      }).session(session);

      // If webhook retries or order already processed, exit safely
      if (!order) {
        await session.abortTransaction();
        return;
      }

      // 2️⃣ Move reserved tickets to sold
      const updateRes = await EventModel.updateOne(
        {
          _id: order.eventId,
          "ticketCategories._id": order.ticketCategoryId,
          "ticketCategories.reservedQuantity": { $gte: order.quantity },
        },
        {
          $inc: {
            "ticketCategories.$.reservedQuantity": -order.quantity,
            ticketSold: order.quantity,
          },
        },
        { session }
      );

      if (updateRes.modifiedCount === 0) {
        throw new Error("Ticket stock mismatch");
      }

      // 3️⃣ Mark order as paid and processed
      await OrderModel.updateOne(
        { _id: orderId, paymentProcessed: false },
        {
          $set: {
            status: ORDER_STATUS.PAID,
            paymentProcessed: true,
          },
        },
        { session }
      );

      await Transaction.updateOne(
        {
          orderId: order._id,
          status: TransactionStatus.PENDING,
        },
        {
          $set: {
            status: TransactionStatus.SUCCEEDED,
            stripeChargeId: intent.latest_charge,
          },
        },
        { session }
      );

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  // ================= REFUND =================
  if (event.type === "charge.refunded") {
  const charge = event.data.object as Stripe.Charge;

  await Transaction.findOneAndUpdate(
    { stripeChargeId: charge.id },
    {
      refundStatus: RefundStatus.SUCCEEDED,
      refundedAt: new Date(),
    }
  );

  return true;
}

};

export { handlePaymentWebhook };
