import { useCallback, useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  Package,
  Search,
  ShoppingBag,
  Store,
  User,
  UserRound,
  X,
} from "lucide-react";

import * as productService from "../../services/productService";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

/* Module-level cache so categories are fetched at most once per session. */
let categoriesCache = null;
let categoriesCacheAt = 0;
const CATEGORIES_TTL = 5 * 60 * 1000;

const navLinkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"
  }`;

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [categories, setCategories] = useState(categoriesCache ?? []);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const profileRef = useRef(null);
  const categoriesRef = useRef(null);

  /* Close popovers when clicking or tabbing elsewhere. */
  useEffect(() => {
    const onPointerDown = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
      if (
        categoriesRef.current &&
        !categoriesRef.current.contains(event.target)
      ) {
        setCategoriesOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  /**
   * Categories come from the product documents themselves - the backend has
   * no /api/categories route. Fetched lazily on first open and cached.
   */
  const loadCategories = useCallback(async () => {
    const fresh =
      categoriesCache && Date.now() - categoriesCacheAt < CATEGORIES_TTL;
    if (fresh) {
      setCategories(categoriesCache);
      return;
    }
    try {
      const products = await productService.list();
      const unique = [
        ...new Set(
          (products ?? [])
            .map((product) => String(product?.category ?? "").trim())
            .filter(Boolean)
        ),
      ].sort((a, b) => a.localeCompare(b));
      categoriesCache = unique;
      categoriesCacheAt = Date.now();
      setCategories(unique);
    } catch {
      setCategories([]);
    }
  }, []);

  const submitSearch = (event) => {
    event.preventDefault();
    const query = searchValue.trim();
    navigate(query ? `/shop?q=${encodeURIComponent(query)}` : "/shop");
    setMobileOpen(false);
  };

  const closeAll = () => {
    setMobileOpen(false);
    setCategoriesOpen(false);
    setProfileOpen(false);
  };

  const cartLink = (
    <Link
      to="/cart"
      onClick={closeAll}
      className="relative rounded-lg p-2 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
      aria-label={`Shopping cart with ${itemCount} item${itemCount === 1 ? "" : "s"}`}
    >
      <ShoppingBag className="h-5 w-5" aria-hidden="true" />
      {itemCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-br from-iris-500 to-glow-500 px-1 text-[10px] font-bold text-white">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </Link>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-night-950/60 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
        {/* Brand */}
        <Link
          to="/"
          onClick={closeAll}
          className="flex shrink-0 items-center gap-2.5"
          aria-label="ShopNest home"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-iris-500 to-glow-500 shadow-lg shadow-iris-600/30">
            <Store className="h-5 w-5 text-white" aria-hidden="true" />
          </span>
          <span className="text-lg font-bold tracking-tight text-white">
            Shop<span className="gradient-text-brand">Nest</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="ml-4 hidden items-center gap-1 md:flex">
          <NavLink to="/" end className={navLinkClass} onClick={closeAll}>
            Home
          </NavLink>
          <NavLink to="/shop" className={navLinkClass} onClick={closeAll}>
            Shop
          </NavLink>

          {/* Categories (derived from GET /api/products) */}
          <div className="relative" ref={categoriesRef}>
            <button
              type="button"
              onClick={() => {
                setCategoriesOpen((open) => !open);
                if (!categoriesOpen) loadCategories();
              }}
              className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
              aria-haspopup="menu"
              aria-expanded={categoriesOpen}
            >
              Categories
              <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
            </button>

            <AnimatePresence>
              {categoriesOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  role="menu"
                  className="glass-strong absolute left-0 top-full mt-2 w-52 rounded-xl p-2"
                >
                  {categories.length === 0 ? (
                    <p className="px-3 py-2 text-xs text-slate-400">
                      No categories available.
                    </p>
                  ) : (
                    categories.map((category) => (
                      <Link
                        key={category}
                        role="menuitem"
                        to={`/shop?category=${encodeURIComponent(category)}`}
                        onClick={closeAll}
                        className="block rounded-lg px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                      >
                        {category}
                      </Link>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Desktop search */}
        <form
          onSubmit={submitSearch}
          className="relative ml-auto hidden max-w-xs flex-1 lg:block"
          role="search"
        >
          <label htmlFor="navbar-search" className="sr-only">
            Search products
          </label>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            id="navbar-search"
            type="search"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Search products…"
            className="input-glass py-2 pl-9 pr-3 text-sm"
          />
        </form>

        {/* Desktop actions */}
        <div className="ml-auto flex items-center gap-1 lg:ml-2">
          {cartLink}

          {isAuthenticated ? (
            <div className="relative hidden md:block" ref={profileRef}>
              <button
                type="button"
                onClick={() => setProfileOpen((open) => !open)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-white/10"
                aria-haspopup="menu"
                aria-expanded={profileOpen}
              >
                <UserRound className="h-4 w-4 text-iris-300" aria-hidden="true" />
                <span className="max-w-24 truncate">{user?.name ?? "Account"}</span>
                <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    role="menu"
                    className="glass-strong absolute right-0 top-full mt-2 w-56 rounded-xl p-2"
                  >
                    <div className="border-b border-white/10 px-3 py-2">
                      <p className="truncate text-sm font-semibold text-white">
                        {user?.name}
                      </p>
                      <p className="truncate text-xs text-slate-400">{user?.email}</p>
                    </div>
                    <Link
                      role="menuitem"
                      to="/profile"
                      onClick={closeAll}
                      className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      <User className="h-4 w-4" aria-hidden="true" />
                      Profile
                    </Link>
                    <Link
                      role="menuitem"
                      to="/orders"
                      onClick={closeAll}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      <Package className="h-4 w-4" aria-hidden="true" />
                      My Orders
                    </Link>
                    {isAdmin && (
                      <Link
                        role="menuitem"
                        to="/admin"
                        onClick={closeAll}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-iris-300 transition-colors hover:bg-white/10"
                      >
                        <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        closeAll();
                        logout();
                        navigate("/");
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-rose-300 transition-colors hover:bg-rose-500/10"
                    >
                      <LogOut className="h-4 w-4" aria-hidden="true" />
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              to="/login"
              className="btn btn-primary hidden px-3 py-2 text-xs md:inline-flex"
            >
              <LogIn className="h-3.5 w-3.5" aria-hidden="true" />
              Sign in
            </Link>
          )}

          {/* Mobile menu trigger */}
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="rounded-lg p-2 text-slate-300 transition-colors hover:bg-white/10 hover:text-white md:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-white/10 bg-night-950/95 backdrop-blur-xl md:hidden"
          >
            <div className="space-y-4 px-4 py-4">
              <form onSubmit={submitSearch} className="relative" role="search">
                <label htmlFor="mobile-search" className="sr-only">
                  Search products
                </label>
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  id="mobile-search"
                  type="search"
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  placeholder="Search products…"
                  className="input-glass py-2.5 pl-9 pr-3"
                />
              </form>

              <div className="flex flex-col gap-1">
                <NavLink to="/" end className={navLinkClass} onClick={closeAll}>
                  Home
                </NavLink>
                <NavLink to="/shop" className={navLinkClass} onClick={closeAll}>
                  Shop
                </NavLink>

                <button
                  type="button"
                  onClick={() => {
                    setCategoriesOpen((open) => !open);
                    if (!categoriesOpen) loadCategories();
                  }}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-white/5"
                  aria-expanded={categoriesOpen}
                >
                  Categories
                  <ChevronDown className="h-4 w-4" aria-hidden="true" />
                </button>

                {categoriesOpen &&
                  (categories.length ? (
                    <div className="ml-3 flex flex-col gap-1 border-l border-white/10 pl-3">
                      {categories.map((category) => (
                        <Link
                          key={category}
                          to={`/shop?category=${encodeURIComponent(category)}`}
                          onClick={closeAll}
                          className="rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-white/5 hover:text-white"
                        >
                          {category}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="px-3 py-1 text-xs text-slate-500">
                      No categories available.
                    </p>
                  ))}
              </div>

              <div className="flex flex-col gap-1 border-t border-white/10 pt-3">
                {isAuthenticated ? (
                  <>
                    <NavLink to="/profile" className={navLinkClass} onClick={closeAll}>
                      Profile
                    </NavLink>
                    <NavLink to="/orders" className={navLinkClass} onClick={closeAll}>
                      My Orders
                    </NavLink>
                    {isAdmin && (
                      <NavLink
                        to="/admin"
                        className={navLinkClass}
                        onClick={closeAll}
                      >
                        Admin Dashboard
                      </NavLink>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        closeAll();
                        logout();
                        navigate("/");
                      }}
                      className="rounded-lg px-3 py-2 text-left text-sm font-medium text-rose-300 hover:bg-rose-500/10"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <NavLink
                    to="/login"
                    className={navLinkClass}
                    onClick={closeAll}
                  >
                    Sign in / Register
                  </NavLink>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
