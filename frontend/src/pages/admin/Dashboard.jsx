import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  IndianRupee,
  Package,
  PackagePlus,
  RefreshCw,
  ShoppingCart,
  Users,
} from "lucide-react";

import * as analyticsService from "../../services/analyticsService";
import { ENDPOINTS } from "../../utils/endpoints";
import { formatINR } from "../../utils/currency";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import ApiEndpointLabel from "../../components/common/ApiEndpointLabel";
import ErrorState from "../../components/common/ErrorState";
import Loader from "../../components/common/Loader";

const STAT_CARDS = [
  { key: "totalOrders", label: "Total orders", icon: ShoppingCart, tint: "from-iris-500/30 to-iris-600/10", iconColor: "text-iris-300" },
  { key: "totalProducts", label: "Total products", icon: Package, tint: "from-glow-500/30 to-glow-600/10", iconColor: "text-glow-300" },
  { key: "totalUsers", label: "Customers", icon: Users, tint: "from-violet-500/30 to-violet-600/10", iconColor: "text-violet-300" },
  { key: "totalRevenue", label: "Revenue", icon: IndianRupee, tint: "from-emerald-500/30 to-emerald-600/10", iconColor: "text-emerald-300", isCurrency: true },
];

export default function Dashboard() {
  useDocumentTitle("Admin overview");

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* GET /api/analytics -> { totalOrders, totalProducts, totalUsers, totalRevenue } */
  const loadStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await analyticsService.getStats();
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Overview</h1>
          <p className="mt-1 text-sm text-slate-400">
            Live store statistics from the analytics API.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <ApiEndpointLabel
            endpoint={ENDPOINTS.analytics}
            description={ENDPOINTS.analytics.description}
          />
          <button
            type="button"
            onClick={loadStats}
            className="btn btn-ghost text-xs"
            aria-label="Refresh statistics"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            Refresh
          </button>
        </div>
      </header>

      {loading && <Loader label="Loading statistics" />}

      {!loading && error && <ErrorState message={error} onRetry={loadStats} />}

      {!loading && !error && stats && (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {STAT_CARDS.map(({ key, label, icon: Icon, tint, iconColor, isCurrency }, index) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.05 }}
              className="glass glass-hover rounded-2xl p-5"
            >
              <div className={`inline-flex rounded-xl bg-gradient-to-br ${tint} p-3`}>
                <Icon className={`h-5 w-5 ${iconColor}`} aria-hidden="true" />
              </div>
              <p className="mt-4 text-xs uppercase tracking-wider text-slate-400">
                {label}
              </p>
              <p className="mt-1 text-2xl font-extrabold text-white">
                {isCurrency
                  ? formatINR(Number(stats[key]) || 0)
                  : Number(stats[key] ?? 0).toLocaleString("en-IN")}
              </p>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && !error && stats && (
        <section className="mt-10">
          <h2 className="mb-4 text-lg font-semibold text-white">Quick actions</h2>
          <div className="flex flex-wrap gap-3">
            <Link to="/admin/products/new" className="btn btn-primary">
              <PackagePlus className="h-4 w-4" aria-hidden="true" />
              Add product
            </Link>
            <Link to="/admin/orders" className="btn btn-outline">
              <ShoppingCart className="h-4 w-4" aria-hidden="true" />
              Manage orders
            </Link>
            <Link to="/admin/users" className="btn btn-outline">
              <Users className="h-4 w-4" aria-hidden="true" />
              View users
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
