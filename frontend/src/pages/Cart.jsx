import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ShoppingCart } from "lucide-react";

import useDocumentTitle from "../hooks/useDocumentTitle";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { formatPaise } from "../utils/currency";
import BackendNote from "../components/common/BackendNote";
import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import CartItem from "../components/cart/CartItem";

export default function Cart() {
  useDocumentTitle("Shopping cart");

  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { items, totalPaise, updateQuantity, removeItem } = useCart();

  if (items.length === 0) {
    return (
      <EmptyState
        icon={ShoppingCart}
        title="Your cart is empty"
        message="Browse the shop and add something you love - it will be saved in this browser."
        action={
          <Link to="/shop" className="btn btn-primary">
            Start shopping
          </Link>
        }
      />
    );
  }

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-white">Your cart</h1>
        <p className="mt-1 text-sm text-slate-400">
          {items.length} product{items.length === 1 ? "" : "s"} ·{" "}
          {items.reduce((sum, item) => sum + item.quantity, 0)} item
          {items.reduce((sum, item) => sum + item.quantity, 0) === 1 ? "" : "s"}
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        {/* Items */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-3"
        >
          {items.map((item) => (
            <CartItem
              key={item.productId}
              item={item}
              onUpdateQuantity={updateQuantity}
              onRemove={(productId) => {
                removeItem(productId);
              }}
            />
          ))}

          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
          >
            ← Continue shopping
          </Link>
        </motion.div>

        {/* Summary */}
        <aside className="glass-strong h-fit rounded-2xl p-6" aria-label="Order summary">
          <h2 className="text-lg font-semibold text-white">Order summary</h2>

          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-slate-400">Subtotal</dt>
              <dd className="font-semibold text-white">{formatPaise(totalPaise)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-400">Shipping</dt>
              <dd className="text-slate-400">
                Calculated by the store (not returned by the API)
              </dd>
            </div>
            <div className="border-t border-white/10 pt-3">
              <div className="flex items-center justify-between">
                <dt className="font-semibold text-white">Total</dt>
                <dd className="text-xl font-extrabold text-white">
                  {formatPaise(totalPaise)}
                </dd>
              </div>
            </div>
          </dl>

          <Button
            fullWidth
            className="mt-6"
            onClick={() =>
              navigate(isAuthenticated ? "/checkout" : "/login", {
                state: isAuthenticated ? undefined : { from: "/checkout" },
              })
            }
          >
            Proceed to checkout
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>

          {!isAuthenticated && (
            <p className="mt-3 text-center text-xs text-slate-400">
              You will be asked to sign in first - orders require an account.
            </p>
          )}

          <BackendNote title="How the cart works">
            <p>
              The backend exposes no cart endpoints, so the cart lives in your
              browser. Prices and stock are re-checked against{" "}
              <code className="font-mono text-[11px]">GET /api/products</code>{" "}
              before any order is created.
            </p>
          </BackendNote>
        </aside>
      </div>
    </div>
  );
}
