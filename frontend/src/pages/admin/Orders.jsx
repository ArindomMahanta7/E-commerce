import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Package, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

import * as orderService from "../../services/orderService";
import { ENDPOINTS } from "../../utils/endpoints";
import { formatINR } from "../../utils/currency";
import { formatDate, getOrderItems, NEXT_STATUS } from "../../utils/orderShape";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import ApiEndpointLabel from "../../components/common/ApiEndpointLabel";
import BackendNote from "../../components/common/BackendNote";
import EmptyState from "../../components/common/EmptyState";
import ErrorState from "../../components/common/ErrorState";
import StatusBadge from "../../components/common/StatusBadge";
import { SkeletonRow } from "../../components/common/Skeleton";

export default function AdminOrders() {
  useDocumentTitle("Manage orders");

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  /* GET /api/orders -> Order[] with populated user + products.product */
  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await orderService.getAllOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const advanceStatus = async (order) => {
    const next = NEXT_STATUS[String(order.status ?? "pending").toLowerCase()];
    if (!next || updatingId) return;

    setUpdatingId(order._id);
    try {
      await orderService.updateOrderStatus(order._id, next);
      toast.success(`Order marked as ${next}`);
      loadOrders();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Orders</h1>
          <p className="mt-1 text-sm text-slate-400">
            {loading
              ? "Loading…"
              : `${orders.length} order${orders.length === 1 ? "" : "s"} across all customers`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <ApiEndpointLabel
            endpoint={ENDPOINTS.listAllOrders}
            description={ENDPOINTS.listAllOrders.description}
          />
          <button
            type="button"
            onClick={loadOrders}
            className="btn btn-ghost text-xs"
            aria-label="Refresh orders"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            Refresh
          </button>
        </div>
      </header>

      <BackendNote title="Status transitions">
        <p>
          The model allows{" "}
          <code className="font-mono text-[11px]">pending → shipped → delivered</code>.
          Only the next valid status is offered below, and each update is a{" "}
          <code className="font-mono text-[11px]">PUT /api/orders/:id/status</code>{" "}
          request. The backend does not validate transitions server-side.
        </p>
      </BackendNote>

      <div className="mt-6">
        {loading && <SkeletonRow count={5} />}

        {!loading && error && <ErrorState message={error} onRetry={loadOrders} />}

        {!loading && !error && orders.length === 0 && (
          <EmptyState
            icon={Package}
            title="No orders yet"
            message="Orders placed by customers will appear here."
            action={
              <Link to="/shop" className="btn btn-outline">
                Visit storefront
              </Link>
            }
          />
        )}

        {!loading && !error && orders.length > 0 && (
          <ul className="space-y-4">
            {orders.map((order) => {
              const items = getOrderItems(order);
              const status = String(order.status ?? "pending").toLowerCase();
              const next = NEXT_STATUS[status];
              const isUpdating = updatingId === order._id;

              return (
                <li key={order._id} className="glass rounded-2xl p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-mono text-xs text-slate-500" title={order._id}>
                        #{String(order._id ?? "").slice(0, 10)}…
                      </p>
                      {order.user ? (
                        <p className="mt-1 text-sm text-white">
                          {order.user.name}
                          <span className="ml-2 text-xs text-slate-400">
                            {order.user.email}
                          </span>
                        </p>
                      ) : (
                        <p className="mt-1 text-sm text-slate-400">
                          Customer details unavailable
                        </p>
                      )}
                      {formatDate(order.createdAt) && (
                        <p className="mt-0.5 text-xs text-slate-500">
                          {formatDate(order.createdAt)}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <StatusBadge status={status} />
                      {next ? (
                        <button
                          type="button"
                          onClick={() => advanceStatus(order)}
                          disabled={isUpdating}
                          className="btn btn-primary px-3 py-2 text-xs"
                          aria-label={`Mark order as ${next}`}
                        >
                          {isUpdating ? "Updating…" : `Mark ${next}`}
                          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      ) : null}
                    </div>
                  </div>

                  <ul className="mt-4 space-y-1 text-sm">
                    {items.length === 0 ? (
                      <li className="text-slate-400">Product details unavailable.</li>
                    ) : (
                      items.map((item, index) => (
                        <li
                          key={item.productId ?? index}
                          className="flex justify-between gap-3 text-slate-300"
                        >
                          <span className="min-w-0 truncate">
                            {item.name}
                            <span className="ml-2 text-xs text-slate-500">
                              × {item.quantity}
                            </span>
                          </span>
                          <span className="shrink-0 text-slate-400">
                            {formatINR(item.price)}
                          </span>
                        </li>
                      ))
                    )}
                  </ul>

                  <div className="mt-4 grid gap-3 border-t border-white/10 pt-4 text-xs text-slate-400 sm:grid-cols-2">
                    {order.address ? (
                      <p>
                        Ship to: {order.address.fullname}, {order.address.street},{" "}
                        {order.address.city}, {order.address.state}
                      </p>
                    ) : (
                      <p>Address unavailable</p>
                    )}
                    <div className="sm:text-right">
                      <p>
                        Payment ref:{" "}
                        <span className="font-mono">
                          {order.paymentId ? "recorded" : "none"}
                        </span>
                      </p>
                      <p className="mt-1 text-sm font-bold text-white">
                        Total: {formatINR(Number(order.totalAmount) || 0)}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
