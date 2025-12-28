import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiErrors";
import QueryBuilder from "../../builder/queryBuilder";
import { IOrder } from "./order.interface";
import { OrderModel } from "./order.model";

/**
 * CREATE ORDER
 */
const createOrderToDB = async (payload: IOrder): Promise<IOrder> => {
  const order = await OrderModel.create(payload);

  if (!order) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Failed to create order"
    );
  }

  return order;
};

/**
 * GET ALL ORDERS
 */
const getAllOrdersFromDB = async (query: any) => {
  const baseQuery = OrderModel.find()
    .populate("userId")
    .populate("productId");

  const queryBuilder = new QueryBuilder<IOrder>(baseQuery, query)
    .search(["status"])
    .filter()
    .sort()
    .fields()
    .paginate();

  const orders = await queryBuilder.modelQuery;
  const meta = await queryBuilder.countTotal();

  if (!orders) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      "No orders found"
    );
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
    .populate("productId");

  if (!order) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      "Order not found by this ID"
    );
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
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      "Order does not exist"
    );
  }

  const updatedOrder = await OrderModel.findByIdAndUpdate(
    id,
    payload,
    { new: true }
  );

  if (!updatedOrder) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Failed to update order"
    );
  }

  return updatedOrder;
};

/**
 * DELETE ORDER
 */
const deleteOrderFromDB = async (id: string): Promise<IOrder> => {
  const isExistOrder = await OrderModel.findById(id);

  if (!isExistOrder) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      "Order does not exist"
    );
  }

  const deletedOrder = await OrderModel.findByIdAndDelete(id);

  if (!deletedOrder) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Failed to delete order"
    );
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
