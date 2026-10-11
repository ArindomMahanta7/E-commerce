import razorpay from "razorpay";
import crypto from "crypto";

import "dotenv/config.js";

const createOrder = async (req, res) => {
    try {
        const RazorpayInstance = new razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
        const options = {
            amount: req.body.amount * 100, // Amount in paise
            currency: "INR",
            receipt : crypto.randomBytes(10).toString("hex"),};
        const order = await RazorpayInstance.orders.create(options);
        res.status(200).json({ order });
    } catch (error) {
        res.status(500).json({ message: "Error creating order" });
    }
};

const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      return res.status(200).json({ message: "Payment verified successfully" });
    } else {
      return res.status(400).json({ message: "Invalid signature sent!" });
    }
  } catch (error) {
    res.status(500).send(error);
  }
};


export { createOrder, verifyPayment };