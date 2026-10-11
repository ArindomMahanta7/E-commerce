/**
 * Currency helpers.
 *
 * The payment integration is Razorpay with `currency: "INR"` (see
 * backend/controllers/paymentController.js), so the whole app uses INR.
 *
 * Money is computed with integer arithmetic in the smallest unit (paise) to
 * avoid floating point drift, and only converted to rupees for display or for
 * the backend's `amount` field (which it multiplies by 100 server-side).
 */

const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/** Rupees (number|string) -> integer paise */
export const toPaise = (rupees) => {
  const value = Number(rupees);
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * 100);
};

/** Integer paise -> rupees number (display only) */
export const fromPaise = (paise) => Number(paise) / 100;

/** Formats a rupees amount as e.g. "₹1,299.99" */
export const formatINR = (rupees) => inrFormatter.format(Number(rupees) || 0);

/** Formats integer paise as e.g. "₹1,299.99" */
export const formatPaise = (paise) => formatINR(fromPaise(paise));

/**
 * Integer-safe total for a list of { price, quantity } lines.
 * @returns total in paise
 */
export const calculateTotalPaise = (lines) =>
  lines.reduce(
    (total, line) => total + toPaise(line.price) * (Number(line.quantity) || 1),
    0
  );
