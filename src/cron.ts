import cron from "node-cron";
import { expirePendingOrders } from "./app/modules/order/order.cron";

export const startCronJobs = () => {
  cron.schedule("* * * * *", async () => {
    await expirePendingOrders();
  });
};
