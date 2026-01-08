import Stripe from "stripe";
import config from "../config";
import { OrderModel } from "../app/modules/order/order.model";
import { ORDER_STATUS } from "../app/modules/order/order.interface";
import Transaction, { RefundStatus, TransactionStatus } from "../app/modules/payment/transaction.model";

const handlePaymentWebhook = async (
  rawBody: Buffer,
  sig: string
) => {
  const event = Stripe.webhooks.constructEvent(
    rawBody,
    sig,
    config.stripe.webhookSecret!
  );

  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object as Stripe.PaymentIntent;

    const orderId = intent.metadata?.orderId;
    if (!orderId) return;

    const order = await OrderModel.findById(orderId);
    if (!order || order.status !== ORDER_STATUS.PENDING) return;

    order.status = ORDER_STATUS.PAID;
    await order.save();

    await Transaction.findOneAndUpdate(
      { stripePaymentIntentId: intent.id },
      {
        status: TransactionStatus.SUCCEEDED,
        stripeChargeId: intent.latest_charge as string,
      }
    );
  }

  if (event.type === "payment_intent.payment_failed") {
    const intent = event.data.object as Stripe.PaymentIntent;

    await Transaction.findOneAndUpdate(
      { stripePaymentIntentId: intent.id },
      { status: TransactionStatus.FAILED }
    );
  }

  if (event.type === "charge.refunded") {
    const charge = event.data.object as Stripe.Charge;

    await Transaction.findOneAndUpdate(
      { stripeChargeId: charge.id },
      {
        refundStatus: RefundStatus.SUCCEEDED,
        refundedAt: new Date(),
      }
    );
  }
};

export { handlePaymentWebhook };
