import ApiError from "../../../errors/ApiErrors";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { IRefundPolicy } from "./refund-policy.interface";
import { RefundPolicy } from "./refund-policy.model";

const createRefundPolicyToDB = async (payload: IRefundPolicy): Promise<IRefundPolicy> => {
  const doc = await RefundPolicy.create(payload);
  if (!doc) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create Refund Policy");
  }
  return doc;
};

const updateRefundPolicyToDB = async (
  id: string,
  payload: Partial<IRefundPolicy>
): Promise<IRefundPolicy> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid ID");
  }

  const updated = await RefundPolicy.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  if (!updated) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Refund Policy not found");
  }
  return updated;
};

const getRefundPolicyFromDB = async (): Promise<IRefundPolicy[]> => {
  return await RefundPolicy.find({}).lean();
};

const deleteRefundPolicyToDB = async (id: string): Promise<void> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid ID");
  }
  const deleted = await RefundPolicy.findByIdAndDelete(id);
  if (!deleted) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Refund Policy not found");
  }
};

export const RefundPolicyService = {
  createRefundPolicyToDB,
  updateRefundPolicyToDB,
  getRefundPolicyFromDB,
  deleteRefundPolicyToDB,
};
