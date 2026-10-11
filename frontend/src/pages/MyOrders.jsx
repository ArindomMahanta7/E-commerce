import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, RefreshCw } from "lucide-react";

import * as orderService from "../services/orderService";
import { ENDPOINTS } from "../utils/endpoints";
import { formatINR } from "../utils/currency";
import { formatDate, getOrderItems } from "../utils/orderShape";
import useDocumentTitle from "../hooks/useDocumentTitle";
import ApiEndpointLabel from "../components/common/ApiEndpointLabel";
import EmptyState from "../components/common/EmptyState";
import ErrorState from "../components/common/ErrorState";
import PageHeader from "../components/common/PageHeader";
import StatusBadge from "../components/common/StatusBadge";
import { SkeletonRow } from "../components/common/Skeleton";

export default function MyOrders() {
  useDocumentTitle("My orders");

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* GET /api/orders/myorders -> { orders: [...] } */
  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await orderService.getMyOrders();
      setOrders(Array.isArray(data?.orders) ? data.orders : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  return (
    <div>
      <PageHeader
        eyebrow="Account"
        title="My orders"
        subtitle="Every order placed with this account, straight from the API."
      >
        <div className="flex flex-wrap items-center gap-3">
          <ApiEndpointLabel
            endpoint={ENDPOINTS.myOrders}
            description={ENDPOINTS.myOrders.description}
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
      </PageHeader>

      {loading && <SkeletonRow count={4} />}

      {!loading && error && (
        <ErrorState message={error} onRetry={loadOrders} />
      )}

      {!loading && !error && orders.length === 0 && (
        <EmptyState
          icon={Package}
          title="No orders yet"
          message="When you place an order it will appear here with its live status."
          action={
            <Link to="/shop" className="btn btn-primary">
              Start shopping
            </Link>
          }
        />
      )}

      {!loading && !error && orders.length > 0 && (
        <ul className="space-y-4">
          {orders.map((order) => {
            const items = getOrderItems(order);
            const total = Number(order.totalAmount) || 0;

            return (
              <li key={order._id} className="glass rounded-2xl p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-xs text-slate-400" title={order._id}>
                      #{shortOrderId(order._id)}
                    </p>
                    {formatDate(order.createdAt) && (
                      <p className="mt-1 text-xs text-slate-500">
                        Placed on {formatDate(order.createdAt)}
                      </p>
                    )}
                  </div>
                  <StatusBadge status={order.status} />
                </div>

                <ul className="mt-4 space-y-1.5">
                  {items.length === 0 ? (
                    <li className="text-sm text-slate-400">
                      Product details unavailable for this order.
                    </li>
                  ) : (
                    items.map((item, index) => (
                      <li
                        key={`${item.productId ?? index}`}
                        className="flex items-center justify-between gap-3 text-sm"
                      >
                        <span className="min-w-0 truncate text-slate-300">
                          {item.productId ? (
                            <Link
                              to={`/products/${item.productId}`}
                              className="transition-colors hover:text-iris-300"
                            >
                              {item.name}
                            </Link>
                          ) : (
                            item.name
                          )}
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

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
                  {order.address?.city ? (
                    <p className="text-xs text-slate-400">
                      Ship to: {order.address.fullname}, {order.address.street},{" "}
                      {order.address.city}, {order.address.state}
                    </p>
                  ) : (
                    <span />
                  )}
                  <p className="text-sm font-bold text-white">
                    Total: {formatINR(total)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function shortOrderId(id) {
  const value = String(id ?? "");
  return value.length > 10 ? `${value.slice(0, 10)}…` : value;
}
