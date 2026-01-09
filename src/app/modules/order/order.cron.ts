import { OrderModel } from "./order.model";
import { ORDER_STATUS } from "./order.interface";

export const expirePendingOrders = async () => {
  await OrderModel.updateMany(
    {
      status: ORDER_STATUS.PENDING,
      expiresAt: { $lt: new Date() },
    },
    {
      status: ORDER_STATUS.CANCELLED,
      cancelledAt: new Date(),
    }
  );
};
