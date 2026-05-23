import Razorpay from "razorpay";

export const getRazorpayInstance = () => {
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay keys are missing in server .env. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.");
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
};
