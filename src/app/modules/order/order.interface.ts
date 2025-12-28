import { Types } from "mongoose";

export enum ORDER_STATUS {
  PENDING = "pending",
  PAID = "paid",
  ONGOING = "ongoing",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export interface IOrder {
  userId: Types.ObjectId;
  eventId: Types.ObjectId;
  transactionId?: Types.ObjectId;
  quantity: number;
  ticketType:  string;
  totalAmount: number;    
  status: ORDER_STATUS;
  contact: {
    name: string;
    email: string;
    countryCode: string;
    phone: string;
  };
  address: {
    line1: string;
    line2?: string;
    city: string;
    zip: string;
    country: string;
  };
  paymentIntentId?: string;
  isCancelled?: boolean;
  payoutProcessed?: boolean;
  payoutAt?: Date;
  cancelledAt?: Date;
  createdAt: string;
  updatedAt: string;
}