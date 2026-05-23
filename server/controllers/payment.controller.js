import crypto from "crypto";
import Payment from "../models/payment.model.js";
import { getRazorpayInstance } from "../services/razorpay.services.js";

const plans = {
  starter: {
    planId: "starter",
    name: "Starter Pack",
    amount: 100,
    credits: 150,
  },
  pro: {
    planId: "pro",
    name: "Pro Pack",
    amount: 500,
    credits: 650,
  },
};

export const getPaymentPlans = async (req, res) => {
  return res.status(200).json({ plans: Object.values(plans) });
};

export const createPaymentOrder = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { planId } = req.body || {};
    const plan = plans[planId];

    if (!plan) {
      return res.status(400).json({ message: "Invalid payment plan" });
    }

    const razorpay = getRazorpayInstance();
    const receipt = `prepai_${req.user._id}_${Date.now()}`.slice(0, 40);
    const order = await razorpay.orders.create({
      amount: plan.amount * 100,
      currency: "INR",
      receipt,
      notes: {
        userId: String(req.user._id),
        planId: plan.planId,
        credits: String(plan.credits),
      },
    });

    const payment = await Payment.create({
      user: req.user._id,
      planId: plan.planId,
      amount: plan.amount,
      credits: plan.credits,
      razorpayOrderId: order.id,
      status: "created",
    });

    return res.status(201).json({
      keyId: process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_ID,
      order,
      paymentId: payment._id,
      plan,
      user: {
        name: req.user.name,
        email: req.user.email,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: `Create payment order error: ${error.message}` });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body || {};

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Payment verification details are missing" });
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      await Payment.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id, user: req.user._id },
        { status: "failed" }
      );
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    const payment = await Payment.findOne({
      razorpayOrderId: razorpay_order_id,
      user: req.user._id,
    });

    if (!payment) {
      return res.status(404).json({ message: "Payment order not found" });
    }

    if (payment.status === "paid") {
      return res.status(200).json({
        message: "Payment already verified",
        credits: req.user.credits,
        user: req.user,
      });
    }

    payment.status = "paid";
    payment.razorpayPaymentId = razorpay_payment_id;
    await payment.save();

    req.user.credits += payment.credits;
    await req.user.save();

    return res.status(200).json({
      message: "Payment verified and credits added",
      addedCredits: payment.credits,
      credits: req.user.credits,
      user: req.user,
      payment,
    });
  } catch (error) {
    return res.status(500).json({ message: `Verify payment error: ${error.message}` });
  }
};
