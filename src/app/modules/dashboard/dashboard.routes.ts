import express from "express";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
import { DashboardController } from "./dashboard.controller";

const router = express.Router();

router.get(
  "/overview",
  auth(USER_ROLES.SUPER_ADMIN),
  DashboardController.getDashboard
);

export const DashboardRoutes = router;
