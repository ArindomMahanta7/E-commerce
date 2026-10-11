/**
 * Razorpay browser-checkout helpers.
 *
 * The checkout widget is loaded on demand from Razorpay's official CDN.
 * The PUBLIC key id comes from VITE_RAZORPAY_KEY_ID; the secret key never
 * leaves backend/.env.
 */

export const RAZORPAY_SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

export const isRazorpayConfigured = () =>
  Boolean(import.meta.env.VITE_RAZORPAY_KEY_ID);

export const loadRazorpayScript = () =>
  new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Razorpay checkout is only available in the browser."));
      return;
    }

    if (window.Razorpay) {
      resolve();
      return;
    }

    const existing = document.querySelector(
      `script[src="${RAZORPAY_SCRIPT_SRC}"]`
    );

    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("Failed to load the Razorpay checkout script."))
      );
      return;
    }

    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      script.remove();
      reject(new Error("Failed to load the Razorpay checkout script."));
    };
    document.body.appendChild(script);
  });

/**
 * Opens the Razorpay checkout and resolves only with the payment response
 * ({ razorpay_order_id, razorpay_payment_id, razorpay_signature }).
 * A failed or dismissed payment rejects - it is never treated as success.
 */
export const openRazorpayCheckout = ({
  key,
  amount,
  currency,
  orderId,
  name,
  description,
  customer,
}) =>
  new Promise((resolve, reject) => {
    if (!window.Razorpay) {
      reject(new Error("Razorpay checkout failed to load."));
      return;
    }

    const razorpay = new window.Razorpay({
      key,
      amount, // paise, as returned by POST /api/payment/order
      currency: currency || "INR",
      order_id: orderId,
      name: name || "ShopNest",
      description,
      prefill: customer
        ? { name: customer.name || "", email: customer.email || "" }
        : undefined,
      theme: { color: "#6366f1" },
      handler: (response) => resolve(response),
    });

    razorpay.on("payment.failed", (response) => {
      const reason =
        response?.error?.description || "Payment failed. Please try again.";
      reject(new Error(reason));
    });

    razorpay.open();
  });
