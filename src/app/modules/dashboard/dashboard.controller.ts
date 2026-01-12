import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { DashboardService } from "./dashboard.service";
 

const getDashboard = catchAsync(async (req: Request, res: Response) => {
  const year = req.query.year ? Number(req.query.year) : new Date().getFullYear();

  const result = await DashboardService.getDashboardData(year);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Dashboard data retrieved successfully",
    data: result,
  });
});

export const DashboardController = {
  getDashboard,
};
