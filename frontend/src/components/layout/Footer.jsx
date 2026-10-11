import { Link } from "react-router-dom";
import { Store } from "lucide-react";

/**
 * Site footer.
 * NOTE: the backend exposes no contact details, shipping/return policies or
 * legal pages, so none of those are invented here.
 */
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-white/10 bg-night-950/60 backdrop-blur-xl">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-iris-500 to-glow-500">
              <Store className="h-5 w-5 text-white" aria-hidden="true" />
            </span>
            <span className="text-lg font-bold text-white">
              Shop<span className="gradient-text-brand">Nest</span>
            </span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
            A premium shopping experience built with a glassmorphism design
            system, powered by the ShopNest REST API.
          </p>
        </div>

        <nav aria-label="Footer navigation">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
            Explore
          </h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {[
              { to: "/", label: "Home" },
              { to: "/shop", label: "Shop" },
              { to: "/cart", label: "Cart" },
              { to: "/orders", label: "My Orders" },
            ].map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="text-slate-400 transition-colors hover:text-iris-300"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Account links">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
            Account
          </h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {[
              { to: "/login", label: "Sign in" },
              { to: "/register", label: "Create account" },
              { to: "/verify-email", label: "Verify email (OTP)" },
              { to: "/profile", label: "Profile" },
            ].map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="text-slate-400 transition-colors hover:text-iris-300"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-white/5 px-4 py-5 text-center text-xs text-slate-500">
        © {year} ShopNest. Built with React, Vite and Tailwind CSS.
      </div>
    </footer>
  );
}
