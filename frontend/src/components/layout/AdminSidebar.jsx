import { NavLink } from "react-router-dom";
import {
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Package,
  ShoppingBag,
  Store,
  Users,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
    isActive
      ? "bg-gradient-to-r from-iris-600/40 to-iris-600/10 text-white shadow-inner border border-iris-400/25"
      : "text-slate-300 hover:bg-white/5 hover:text-white border border-transparent"
  }`;

const NAV_ITEMS = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/products", label: "Products", icon: ShoppingBag },
  { to: "/admin/orders", label: "Orders", icon: Package },
  { to: "/admin/users", label: "Users", icon: Users },
];

/** Sidebar navigation for the admin area (desktop + drawer). */
export default function AdminSidebar({ onNavigate }) {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-full flex-col gap-6 p-5">
      <NavLink to="/" className="flex items-center gap-2.5" onClick={onNavigate}>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-iris-500 to-glow-500">
          <Store className="h-5 w-5 text-white" aria-hidden="true" />
        </span>
        <span className="text-lg font-bold text-white">
          Shop<span className="gradient-text-brand">Nest</span>
          <span className="ml-2 rounded-md border border-iris-400/30 bg-iris-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-iris-300">
            Admin
          </span>
        </span>
      </NavLink>

      <nav aria-label="Admin navigation" className="flex flex-col gap-1.5">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={linkClass} onClick={onNavigate}>
            <Icon className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto space-y-1.5 border-t border-white/10 pt-4">
        <NavLink
          to="/"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
        >
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
          View storefront
        </NavLink>
        <button
          type="button"
          onClick={() => {
            onNavigate?.();
            logout();
          }}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-rose-300 transition-colors hover:bg-rose-500/10"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Logout
        </button>

        {user && (
          <p className="truncate px-4 pt-2 text-xs text-slate-500">
            Signed in as {user.email}
          </p>
        )}
      </div>
    </div>
  );
}
