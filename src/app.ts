import express, { Application, Request, Response } from "express";
import cors from "cors";
import { StatusCodes } from "http-status-codes";
import { Morgan } from "./shared/morgan";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import path from "path";
import { PaymentController } from "./app/modules/payment/payment.controller";
import { globalRateLimiter } from "./app/middlewares/rateLimiter";
import router from "./app/routes";

const app: Application = express();

app.post(
  "/api/v1/payments/webhook/stripe",
  express.raw({ type: "application/json" }),
  PaymentController.stripeWebhook,
);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// morgan
app.use(Morgan.successHandler);
app.use(Morgan.errorHandler);

//body parser
app.use(
  cors({
    origin: [
      "http://10.10.7.46:30011",
      "http://10.10.7.41:5003",
      "http://10.10.7.49:3000",
      "http://10.10.7.49:1001",
      "http://10.10.7.6:1001",
      "https://admin-ticket-booking.netlify.app",
      "http://72.62.190.141:3000",
      "http://72.62.190.141:4173",
      "http://adrienticket.com",
      "http://dashboard.adrienticket.com",
      "https://ticket-booking-dashboard-ad.vercel.app",
      "https://adrien-ticket-booking-website.vercel.app",
    ],
    credentials: true,
  }),
);

app.use(express.json({ limit: "1mb" }));

// app.use(express.urlencoded({ extended: true }));

app.use(express.urlencoded({ extended: true, limit: "1mb" }));

//file retrieve
app.use(express.static("uploads"));

//router
app.use("/api/v1", router);

app.get("/", (req: Request, res: Response) => {
  res.send("Server is running...");
});

//global error handle
app.use(globalErrorHandler);

// handle not found route
app.use((req: Request, res: Response) => {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: "Not Found",
    errorMessages: [
      {
        path: req.originalUrl,
        message: "API DOESN'T EXIST",
      },
    ],
  });
});

export default app;
