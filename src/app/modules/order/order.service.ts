import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiErrors";
import QueryBuilder from "../../builder/queryBuilder";
import { IOrder, ORDER_STATUS } from "./order.interface";
import { OrderModel } from "./order.model";
import mongoose, { Types } from "mongoose";
import { User } from "../user/user.model";
import { EventModel } from "../event/event.model";
import { calculateServiceFee } from "../../../util/serviceFeeCalculation";

/**
 * CREATE ORDER
 */
const createOrderToDB = async (payload: IOrder): Promise<IOrder> => {
  const user = await User.findById(payload.userId).lean();
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
  }

  const event = await EventModel.findById(payload.eventId).lean();
  if (!event) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Event not found");
  }

  if (!event.ticketCategories?.length) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "No ticket categories found for this event"
    );
  }

  const ticketCategoryObjectId = new Types.ObjectId(payload.ticketCategoryId);

  const ticketCategory = event.ticketCategories.find((tc) =>
    tc._id.equals(ticketCategoryObjectId)
  );
  console.log("Ticket Category Found:", ticketCategory);

  if (!ticketCategory) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid ticket category");
  }

  const quantity = payload.quantity;

  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid ticket quantity");
  }

  if (event.eventDate && new Date(event.eventDate) < new Date()) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Event has already occurred");
  }

  if (ticketCategory.totalQuantity < quantity) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Not enough tickets available");
  }

  const subtotalAmount = ticketCategory.pricePerTicket * quantity;
  const serviceFee = calculateServiceFee(user, subtotalAmount);
  const totalAmount = subtotalAmount + serviceFee;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const updateRes = await EventModel.updateOne(
      {
        _id: payload.eventId,
        "ticketCategories._id": ticketCategoryObjectId,
        "ticketCategories.totalQuantity": { $gte: quantity },
      },
      {
        $inc: {
          ticketSold: quantity,
          "ticketCategories.$.totalQuantity": -quantity,
        },
      },
      { session }
    );

    if (updateRes.modifiedCount === 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Ticket sold out");
    }

    const orderDoc = await OrderModel.create(
      [
        {
          userId: payload.userId,
          eventId: payload.eventId,
          ticketCategoryId: payload.ticketCategoryId,

          ticketType: ticketCategory.ticketName, // ✅ REQUIRED FIELD FIX

          quantity: payload.quantity,
          subtotalAmount,
          serviceFee,
          totalAmount,

          contact: payload.contact, // ✅ FIX
          address: payload.address, // ✅ FIX

          status: ORDER_STATUS.PENDING,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return orderDoc[0];
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

/**
 * GET ALL ORDERS
 */
const getAllOrdersFromDB = async (query: any) => {
  const baseQuery = OrderModel.find().populate("userId").populate("eventId");

  const queryBuilder = new QueryBuilder<IOrder>(baseQuery, query)
    .search(["status"])
    .filter()
    .sort()
    .fields()
    .paginate();

  const orders = await queryBuilder.modelQuery;
  const meta = await queryBuilder.countTotal();

  if (!orders) {
    throw new ApiError(StatusCodes.NOT_FOUND, "No orders found");
  }

  return {
    data: orders,
    meta,
  };
};

/**
 * GET ORDER BY ID
 */
const getOrderByIdFromDB = async (id: string): Promise<IOrder> => {
  const order = await OrderModel.findById(id)
    .populate("userId")
    .populate("eventId");

  if (!order) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Order not found by this ID");
  }

  return order;
};

/**
 * UPDATE ORDER
 */
const updateOrderToDB = async (
  id: string,
  payload: Partial<IOrder>
): Promise<IOrder | null> => {
  const isExistOrder = await OrderModel.findById(id);

  if (!isExistOrder) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Order does not exist");
  }

  const updatedOrder = await OrderModel.findByIdAndUpdate(id, payload, {
    new: true,
  });

  if (!updatedOrder) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to update order");
  }

  return updatedOrder;
};

/**
 * DELETE ORDER
 */
const deleteOrderFromDB = async (id: string): Promise<IOrder> => {
  const isExistOrder = await OrderModel.findById(id);

  if (!isExistOrder) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Order does not exist");
  }

  const deletedOrder = await OrderModel.findByIdAndDelete(id);

  if (!deletedOrder) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to delete order");
  }

  return deletedOrder;
};

export const OrderService = {
  createOrderToDB,
  getAllOrdersFromDB,
  getOrderByIdFromDB,
  updateOrderToDB,
  deleteOrderFromDB,
};
