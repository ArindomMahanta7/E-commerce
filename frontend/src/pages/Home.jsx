import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Layers, ShieldCheck, Sparkles, Truck } from "lucide-react";
import toast from "react-hot-toast";

import * as productService from "../services/productService";
import { ENDPOINTS } from "../utils/endpoints";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { useCart } from "../context/CartContext";
import ApiEndpointLabel from "../components/common/ApiEndpointLabel";
import ErrorState from "../components/common/ErrorState";
import ProductGrid from "../components/products/ProductGrid";

const FEATURES = [
  {
    icon: Sparkles,
    title: "Curated picks",
    text: "A focused catalogue rendered on frosted-glass surfaces.",
  },
  {
    icon: ShieldCheck,
    title: "Verified accounts",
    text: "Email OTP verification and server-side JWT authorization.",
  },
  {
    icon: Truck,
    title: "Tracked orders",
    text: "Follow every order from pending to shipped to delivered.",
  },
  {
    icon: Layers,
    title: "Glass design system",
    text: "Layered gradients, soft glows and smooth micro-interactions.",
  },
];

export default function Home() {
  useDocumentTitle("Premium shopping, reimagined");

  const { addItem } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await productService.list();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleAddToCart = (product) => {
    addItem(product, 1);
    toast.success(`${product.name} added to cart`);
  };

  /* Newest first using the schema's createdAt field, falling back to list order. */
  const featured = [...products]
    .sort(
      (a, b) => new Date(b?.createdAt ?? 0).getTime() - new Date(a?.createdAt ?? 0).getTime()
    )
    .slice(0, 8);

  const categories = [
    ...new Set(
      products.map((p) => String(p?.category ?? "").trim()).filter(Boolean)
    ),
  ].slice(0, 6);

  return (
    <div className="space-y-20">
      {/* ---------------------------------------------- Hero */}
      <section className="relative overflow-hidden pt-6 sm:pt-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass-strong relative mx-auto max-w-4xl rounded-3xl px-6 py-14 text-center sm:px-12"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-iris-400/30 bg-iris-500/10 px-4 py-1.5 text-xs font-semibold text-iris-300">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Fresh drops, glass-clear shopping
          </span>

          <h1 className="gradient-text mt-6 text-4xl font-extrabold tracking-tight sm:text-6xl">
            Shop the future,
            <br />
            one glass panel at a time
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
            Discover premium products in a luminous storefront built on
            frosted-glass surfaces, soft gradients and effortless checkout.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/shop" className="btn btn-primary px-6 py-3 text-base">
              Shop now
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link to="/register" className="btn btn-outline px-6 py-3 text-base">
              Create an account
            </Link>
          </div>

          <p className="mt-6 text-xs text-slate-500">
            Browsing the catalogue needs no account - signing in is only required
            to place an order.
          </p>
        </motion.div>
      </section>

      {/* ---------------------------------------------- Category chips */}
      {categories.length > 0 && (
        <section aria-labelledby="categories-heading">
          <h2 id="categories-heading" className="mb-4 text-xl font-bold text-white">
            Shop by category
          </h2>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <Link
                key={category}
                to={`/shop?category=${encodeURIComponent(category)}`}
                className="glass glass-hover rounded-full px-5 py-2.5 text-sm font-medium text-slate-200"
              >
                {category}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ---------------------------------------------- Featured products */}
      <section aria-labelledby="featured-heading">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="featured-heading" className="text-2xl font-bold text-white">
              Recently added
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Straight from the catalogue, newest first.
            </p>
          </div>
          <Link
            to="/shop"
            className="text-sm font-semibold text-iris-300 transition-colors hover:text-iris-200"
          >
            View all products →
          </Link>
        </div>

        <ApiEndpointLabel
          endpoint={ENDPOINTS.listProducts}
          description={ENDPOINTS.listProducts.description}
          className="mb-4"
        />

        {error ? (
          <ErrorState message={error} onRetry={loadProducts} />
        ) : (
          <ProductGrid
            products={featured}
            loading={loading}
            onAddToCart={handleAddToCart}
          />
        )}
      </section>

      {/* ---------------------------------------------- Feature panels */}
      <section aria-labelledby="why-heading" className="pb-6">
        <h2 id="why-heading" className="mb-6 text-2xl font-bold text-white">
          Built for a premium feel
        </h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, text }, index) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.06 }}
              className="glass glass-hover rounded-2xl p-5"
            >
              <div className="mb-3 inline-flex rounded-xl border border-white/10 bg-gradient-to-br from-iris-500/25 to-glow-500/15 p-3">
                <Icon className="h-5 w-5 text-iris-300" aria-hidden="true" />
              </div>
              <h3 className="text-sm font-semibold text-white">{title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-400">{text}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
