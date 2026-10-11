import { call, ENDPOINTS } from "./api";

/**
 * /api/payment service (Razorpay).
 * Verified against backend/routes/paymentRoutes.js and controllers/paymentController.js.
 *
 * Both routes ARE mounted in backend/index.js (app.use("/api/payment", ...))
 * and are public (no `protect` middleware).
 */

/**
 * POST /api/payment/order
 * Backend: `amount: req.body.amount * 100` -> paise, currency "INR".
 * @param {number} amountRupees total payable in INR rupees
 * @returns {Promise<{order: {id: string, amount: number, currency: string, receipt: string}>}}
 */
export const createPaymentOrder = (amountRupees) =>
  call(ENDPOINTS.createPaymentOrder, { data: { amount: amountRupees } });

/**
 * POST /api/payment/verify
 * Backend recomputes the HMAC signature with RAZORPAY_KEY_SECRET; a frontend
 * callback alone is never treated as proof of payment.
 * @returns {Promise<{message: string}>}
 */
export const verifyPayment = ({
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
}) =>
  call(ENDPOINTS.verifyPayment, {
    data: { razorpay_order_id, razorpay_payment_id, razorpay_signature },
  });
