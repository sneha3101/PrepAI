import express from "express";
import { createPaymentOrder, getPaymentPlans, verifyPayment } from "../controllers/payment.controller.js";
import isAuth from "../middlewares/isAuth.js";

const paymentRouter = express.Router();

paymentRouter.get("/plans", getPaymentPlans);
paymentRouter.post("/create-order", isAuth, createPaymentOrder);
paymentRouter.post("/verify", isAuth, verifyPayment);

export default paymentRouter;
