import mongoose from "mongoose";
import { OrderModel } from "./order.model";
import { ORDER_STATUS } from "./order.interface";
import { EventModel } from "../event/event.model";
import Transaction, { TransactionStatus } from "../payment/transaction.model";

const expirePendingOrders = async () => {
  const expiredOrders = await OrderModel.find({
    status: ORDER_STATUS.PENDING,
    expiresAt: { $lt: new Date() },
  });

  for (const order of expiredOrders) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      await EventModel.updateOne(
        {
          _id: order.eventId,
          "ticketCategories._id": order.ticketCategoryId,
        },
        {
          $inc: {
            "ticketCategories.$.reservedQuantity": -order.quantity,
            "ticketCategories.$.totalQuantity": order.quantity,
          },
        },
        { session }
      );

      order.status = ORDER_STATUS.CANCELLED;
      order.isCancelled = true;
      order.cancelledAt = new Date();
      await order.save({ session });
       // cancel related transaction
      await Transaction.updateMany(
        {
          orderId: order._id,
          status: TransactionStatus.PENDING,
        },
        {
          status: TransactionStatus.CANCELLED,
        },
        { session }
      );

      await session.commitTransaction();
    } catch (e) {
      await session.abortTransaction();
      throw e;
    } finally {
      session.endSession();
    }
  }
};
export { expirePendingOrders };
