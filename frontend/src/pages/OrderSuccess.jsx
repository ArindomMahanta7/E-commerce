import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Package } from "lucide-react";

import useDocumentTitle from "../hooks/useDocumentTitle";
import { shortId } from "../utils/orderShape";
import EmptyState from "../components/common/EmptyState";

/**
 * Shown only after the backend confirmed order creation (HTTP 201).
 * Checkout navigates here with the real order id returned by the API.
 */
export default function OrderSuccess() {
  useDocumentTitle("Order confirmed");

  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const lines = Number(searchParams.get("lines")) || 1;

  if (!orderId) {
    return (
      <EmptyState
        title="No order to show"
        message="This page is shown after a successful order. Browse the shop to place one."
        action={
          <Link to="/shop" className="btn btn-primary">
            Go to shop
          </Link>
        }
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-strong mx-auto max-w-2xl rounded-3xl px-6 py-14 text-center"
    >
      <div className="mx-auto w-fit rounded-full border border-emerald-400/30 bg-emerald-500/10 p-4">
        <CheckCircle2 className="h-10 w-10 text-emerald-300" aria-hidden="true" />
      </div>

      <h1 className="mt-6 text-2xl font-bold text-white sm:text-3xl">
        Order confirmed!
      </h1>

      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-300">
        Your payment was verified and the backend created your order. A
        confirmation email is sent by the server.
      </p>

      <div className="glass-subtle mx-auto mt-6 w-fit rounded-xl px-5 py-3">
        <p className="text-xs uppercase tracking-wider text-slate-400">Order ID</p>
        <p className="mt-1 font-mono text-sm text-white" title={orderId}>
          {shortId(orderId, 12)}
        </p>
        {lines > 1 && (
          <p className="mt-1 text-xs text-slate-400">
            {lines} order lines created
          </p>
        )}
      </div>

      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link to="/orders" className="btn btn-primary px-6">
          <Package className="h-4 w-4" aria-hidden="true" />
          View my orders
        </Link>
        <Link to="/shop" className="btn btn-outline px-6">
          Continue shopping
        </Link>
      </div>
    </motion.div>
  );
}
