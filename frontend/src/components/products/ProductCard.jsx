import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, ShoppingBag } from "lucide-react";

import { formatINR } from "../../utils/currency";

/**
 * Glass product card used on Home, Shop and Product Details.
 * The image sits on a solid dark plate so backdrop blur never reduces clarity.
 */
export default function ProductCard({ product, onAddToCart, adding = false }) {
  const stock = Number(product.stock) || 0;
  const outOfStock = stock <= 0;

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35 }}
      className="glass glass-hover group flex flex-col overflow-hidden rounded-2xl"
    >
      <Link
        to={`/products/${product._id}`}
        className="relative block aspect-[4/3] overflow-hidden bg-night-800"
        aria-label={`View details for ${product.name}`}
      >
        {product.imageURLs ? (
          <img
            src={product.imageURLs}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-500">
            <ShoppingBag className="h-10 w-10" aria-hidden="true" />
          </div>
        )}

        <span
          className={`absolute left-3 top-3 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold backdrop-blur-md ${
            outOfStock
              ? "border-rose-400/40 bg-rose-500/20 text-rose-200"
              : stock <= 5
                ? "border-amber-400/40 bg-amber-500/20 text-amber-200"
                : "border-emerald-400/40 bg-emerald-500/20 text-emerald-200"
          }`}
        >
          {outOfStock ? "Out of stock" : `${stock} in stock`}
        </span>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        {product.category && (
          <span className="text-[11px] font-semibold uppercase tracking-wider text-iris-300">
            {product.category}
          </span>
        )}

        <Link to={`/products/${product._id}`} className="min-h-0">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-white transition-colors hover:text-iris-300">
            {product.name}
          </h3>
        </Link>

        <p className="line-clamp-2 text-xs text-slate-400">{product.description}</p>

        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <span className="text-lg font-bold text-white">
            {formatINR(product.price)}
          </span>

          <div className="flex items-center gap-1.5">
            <Link
              to={`/products/${product._id}`}
              className="rounded-lg border border-white/10 bg-white/5 p-2 text-slate-300 transition-colors hover:border-iris-400/50 hover:text-white"
              aria-label={`View details for ${product.name}`}
              title="View details"
            >
              <Eye className="h-4 w-4" aria-hidden="true" />
            </Link>
            <button
              type="button"
              onClick={() => onAddToCart?.(product)}
              disabled={outOfStock || adding}
              className="btn btn-primary px-3 py-2 text-xs"
              aria-label={`Add ${product.name} to cart`}
            >
              <ShoppingBag className="h-3.5 w-3.5" aria-hidden="true" />
              Add
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
