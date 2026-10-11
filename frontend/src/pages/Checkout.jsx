import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CreditCard, Lock, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

import * as productService from "../services/productService";
import * as orderService from "../services/orderService";
import * as paymentService from "../services/paymentService";
import { ENDPOINTS } from "../utils/endpoints";
import { calculateTotalPaise, formatPaise, fromPaise, toPaise } from "../utils/currency";
import {
  isRazorpayConfigured,
  loadRazorpayScript,
  openRazorpayCheckout,
} from "../utils/razorpay";
import { EMPTY_ADDRESS, firstError, validateAddress } from "../utils/validators";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import ApiEndpointLabel from "../components/common/ApiEndpointLabel";
import BackendNote from "../components/common/BackendNote";
import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";

export default function Checkout() {
  useDocumentTitle("Checkout");

  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, totalPaise, clearCart } = useCart();

  const [address, setAddress] = useState({
    ...EMPTY_ADDRESS,
    fullname: user?.name ?? "",
  });
  const [addressErrors, setAddressErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [paymentReady, setPaymentReady] = useState(true);

  /* Fresh prices/stock are always re-read from the backend before ordering. */
  useEffect(() => {
    let cancelled = false;
    const checkBackend = async () => {
      try {
        await productService.list();
        if (!cancelled) setPaymentReady(true);
      } catch {
        if (!cancelled) setPaymentReady(false);
      }
    };
    checkBackend();
    return () => {
      cancelled = true;
    };
  }, []);

  const onAddressChange = (field) => (event) => {
    setAddress((current) => ({ ...current, [field]: event.target.value }));
    setAddressErrors((current) => ({ ...current, [field]: undefined }));
  };

  if (items.length === 0) {
    return (
      <EmptyState
        title="Your cart is empty"
        message="Add products to your cart before checking out."
        action={
          <Link to="/shop" className="btn btn-primary">
            Go to shop
          </Link>
        }
      />
    );
  }

  /**
   * Checkout pipeline - every step is a real backend call:
   *  1. POST /api/payment/order   -> Razorpay payment order (amount in rupees)
   *  2. Razorpay checkout widget  -> payment identifiers + signature
   *  3. POST /api/payment/verify  -> server-side signature verification
   *  4. POST /api/orders          -> order creation (requires the verified paymentId)
   *
   * The order is only considered successful once step 4 returns 201.
   */
  const handlePlaceOrder = async (event) => {
    event.preventDefault();
    if (submitting) return; // guard against double clicks

    const errors = validateAddress(address);
    setAddressErrors(errors);
    if (firstError(errors)) {
      toast.error("Please complete the shipping address.");
      return;
    }

    if (!isRazorpayConfigured()) {
      toast.error(
        "Payment is not configured. Set VITE_RAZORPAY_KEY_ID in frontend/.env."
      );
      return;
    }

    setSubmitting(true);

    try {
      /* ---- 1. Re-validate cart against authoritative backend data ---- */
      const freshProducts = await productService.list();
      const byId = new Map(
        (Array.isArray(freshProducts) ? freshProducts : []).map((p) => [p._id, p])
      );

      const validatedLines = [];
      for (const item of items) {
        const fresh = byId.get(item.productId);
        if (!fresh) {
          throw new Error(
            `"${item.name}" is no longer available and was removed from your order.`
          );
        }
        if ((Number(fresh.stock) || 0) < item.quantity) {
          throw new Error(
            `Only ${fresh.stock} of "${fresh.name}" remain in stock.`
          );
        }
        validatedLines.push({
          productId: fresh._id,
          name: fresh.name,
          quantity: item.quantity,
          price: Number(fresh.price) || 0,
        });
      }

      /* Totals are recomputed from backend prices, never from client state. */
      const total = calculateTotalPaise(validatedLines);
      const totalRupees = Number(fromPaise(total).toFixed(2));

      /* ---- 2. Create the Razorpay payment order ---- */
      const { order: paymentOrder } =
        await paymentService.createPaymentOrder(totalRupees);

      if (!paymentOrder?.id) {
        throw new Error(
          "The payment service did not return a payment order. Check the backend Razorpay keys in backend/.env."
        );
      }

      /* ---- 3. Open Razorpay checkout ---- */
      await loadRazorpayScript();
      const payment = await openRazorpayCheckout({
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency || "INR",
        orderId: paymentOrder.id,
        name: "ShopNest",
        description: `${validatedLines.length} item${validatedLines.length === 1 ? "" : "s"}`,
        customer: { name: user?.name, email: user?.email },
      });

      /* ---- 4. Verify the signature server-side (never trust the callback) ---- */
      await paymentService.verifyPayment({
        razorpay_order_id: payment.razorpay_order_id,
        razorpay_payment_id: payment.razorpay_payment_id,
        razorpay_signature: payment.razorpay_signature,
      });

      /* ---- 5. Create the order(s) ----
         model/orders.js stores a single { product, quantity, price } document
         per order, so a multi-item cart results in one POST per line, all
         sharing the same verified Razorpay payment id. */
      const createdOrders = [];
      for (const line of validatedLines) {
        const response = await orderService.createOrder({
          products: {
            product: line.productId,
            quantity: line.quantity,
            price: line.price,
          },
          totalAmount: fromPaise(
            calculateTotalPaise([{ price: line.price, quantity: line.quantity }])
          ),
          address: {
            fullname: address.fullname.trim(),
            street: address.street.trim(),
            city: address.city.trim(),
            state: address.state.trim(),
          },
          paymentId: payment.razorpay_payment_id,
        });
        createdOrders.push(response?.order);
      }

      clearCart();

      const firstOrderId = createdOrders?.[0]?._id;
      navigate(
        `/order-success${
          firstOrderId ? `?orderId=${encodeURIComponent(firstOrderId)}` : ""
        }&lines=${validatedLines.length}`,
        { replace: true }
      );
    } catch (error) {
      const message =
        error?.message ||
        "Checkout failed. You have not been charged twice - please try again.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-white">Checkout</h1>
        <p className="mt-1 text-sm text-slate-400">
          Payments are processed by Razorpay and verified by the backend before
          any order is created.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_24rem]">
        <form onSubmit={handlePlaceOrder} className="space-y-6" noValidate>
          {/* ------------------------------------------ Order summary */}
          <section className="glass rounded-2xl p-6" aria-labelledby="summary-heading">
            <h2 id="summary-heading" className="text-lg font-semibold text-white">
              Order summary
            </h2>

            <ul className="mt-4 divide-y divide-white/5">
              {items.map((item) => (
                <li
                  key={item.productId}
                  className="flex items-center justify-between gap-4 py-3 text-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-white">{item.name}</p>
                    <p className="text-xs text-slate-400">
                      {item.quantity} × {formatPaise(item.price)}
                    </p>
                  </div>
                  <span className="shrink-0 font-semibold text-white">
                    {formatPaise(toPaise(item.price) * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
              <span className="font-semibold text-white">Total</span>
              <span className="text-xl font-extrabold text-white">
                {formatPaise(totalPaise)}
              </span>
            </div>
          </section>

          {/* ------------------------------------------ Shipping address */}
          <section className="glass rounded-2xl p-6" aria-labelledby="address-heading">
            <h2 id="address-heading" className="text-lg font-semibold text-white">
              Shipping address
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              These fields mirror the address structure the order API requires.
            </p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="address-fullname" className="label-glass">
                  Full name
                </label>
                <input
                  id="address-fullname"
                  className="input-glass"
                  value={address.fullname}
                  onChange={onAddressChange("fullname")}
                  aria-invalid={Boolean(addressErrors.fullname)}
                  autoComplete="name"
                  required
                />
                {addressErrors.fullname && (
                  <p className="mt-1 text-xs text-rose-300">
                    {addressErrors.fullname}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="address-street" className="label-glass">
                  Street address
                </label>
                <input
                  id="address-street"
                  className="input-glass"
                  value={address.street}
                  onChange={onAddressChange("street")}
                  aria-invalid={Boolean(addressErrors.street)}
                  autoComplete="address-line1"
                  required
                />
                {addressErrors.street && (
                  <p className="mt-1 text-xs text-rose-300">
                    {addressErrors.street}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="address-city" className="label-glass">
                  City
                </label>
                <input
                  id="address-city"
                  className="input-glass"
                  value={address.city}
                  onChange={onAddressChange("city")}
                  aria-invalid={Boolean(addressErrors.city)}
                  autoComplete="address-level2"
                  required
                />
                {addressErrors.city && (
                  <p className="mt-1 text-xs text-rose-300">{addressErrors.city}</p>
                )}
              </div>

              <div>
                <label htmlFor="address-state" className="label-glass">
                  State
                </label>
                <input
                  id="address-state"
                  className="input-glass"
                  value={address.state}
                  onChange={onAddressChange("state")}
                  aria-invalid={Boolean(addressErrors.state)}
                  autoComplete="address-level1"
                  required
                />
                {addressErrors.state && (
                  <p className="mt-1 text-xs text-rose-300">{addressErrors.state}</p>
                )}
              </div>
            </div>
          </section>

          {/* ------------------------------------------ Place order */}
          <motion.section
            layout
            className="glass-strong rounded-2xl p-6"
            aria-labelledby="place-order-heading"
          >
            <h2 id="place-order-heading" className="text-lg font-semibold text-white">
              Payment
            </h2>

            <div className="mt-3 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
              <CreditCard className="h-5 w-5 shrink-0 text-iris-300" aria-hidden="true" />
              <span>
                Razorpay secure checkout · total charged{" "}
                <strong className="text-white">{formatPaise(totalPaise)}</strong>
              </span>
            </div>

            <p className="mt-3 flex items-center gap-2 text-xs text-slate-400">
              <Lock className="h-3.5 w-3.5" aria-hidden="true" />
              Your card details are entered on Razorpay's checkout, never on this
              site.
            </p>

            {/* API requests triggered by the button below */}
            <div className="mt-5 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Requests made when you place this order
              </p>
              <ApiEndpointLabel
                endpoint={ENDPOINTS.createPaymentOrder}
                description={ENDPOINTS.createPaymentOrder.description}
              />
              <ApiEndpointLabel
                endpoint={ENDPOINTS.verifyPayment}
                description={ENDPOINTS.verifyPayment.description}
              />
              <ApiEndpointLabel
                endpoint={ENDPOINTS.createOrder}
                description={ENDPOINTS.createOrder.description}
              />
              <ApiEndpointLabel
                endpoint={ENDPOINTS.listProducts}
                description="Cart contents are re-validated against this before ordering"
              />
            </div>

            <Button
              type="submit"
              fullWidth
              loading={submitting}
              className="mt-5 py-3 text-base"
            >
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              {submitting ? "Processing payment…" : "Place order"}
            </Button>

            <BackendNote title="Known backend limitation">
              <p>
                <code className="font-mono text-[11px]">POST /api/orders</code>{" "}
                currently returns <strong>500</strong> because{" "}
                <code className="font-mono text-[11px]">addOrderItems</code> passes
                an undefined <code className="font-mono text-[11px]">items</code>{" "}
                variable to <code className="font-mono text-[11px]">new Order()</code>.
                The frontend sends the documented payload; the backend controller
                needs a fix before orders can succeed.
              </p>
              {!isRazorpayConfigured() && (
                <p>
                  Also missing: <code className="font-mono text-[11px]">VITE_RAZORPAY_KEY_ID</code>{" "}
                  is not set in <code className="font-mono text-[11px]">frontend/.env</code>, and the
                  backend <code className="font-mono text-[11px]">.env</code> has no
                  Razorpay keys.
                </p>
              )}
              {!paymentReady && (
                <p>
                  The product catalogue could not be reached - check that the
                  backend is running.
                </p>
              )}
            </BackendNote>
          </motion.section>
        </form>
      </div>
    </div>
  );
}
