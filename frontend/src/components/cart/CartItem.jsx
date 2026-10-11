import { Link } from "react-router-dom";
import { Minus, Plus, Trash2 } from "lucide-react";

import { formatINR, toPaise } from "../../utils/currency";

/** A single line in the shopping cart. */
export default function CartItem({ item, onUpdateQuantity, onRemove }) {
  const lineTotalPaise = toPaise(item.price) * item.quantity;

  return (
    <article className="glass flex flex-col gap-4 rounded-2xl p-4 sm:flex-row sm:items-center">
      <div className="h-24 w-full shrink-0 overflow-hidden rounded-xl bg-night-800 sm:h-20 sm:w-20">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-600">
            <span className="text-xs">No image</span>
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <Link
          to={`/products/${item.productId}`}
          className="line-clamp-1 text-sm font-semibold text-white transition-colors hover:text-iris-300"
        >
          {item.name}
        </Link>
        <p className="mt-1 text-xs text-slate-400">
          {formatINR(item.price)} each
          {item.stock > 0 && (
            <span className="ml-2 text-slate-500">· {item.stock} available</span>
          )}
        </p>
      </div>

      <div className="flex items-center justify-between gap-4 sm:justify-end">
        <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
          <button
            type="button"
            onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
            disabled={item.quantity <= 1}
            className="rounded-lg p-1.5 text-slate-300 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-40"
            aria-label={`Decrease quantity of ${item.name}`}
          >
            <Minus className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <span
            className="w-8 text-center text-sm font-semibold text-white"
            aria-live="polite"
          >
            {item.quantity}
          </span>
          <button
            type="button"
            onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
            disabled={item.quantity >= item.stock}
            className="rounded-lg p-1.5 text-slate-300 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-40"
            aria-label={`Increase quantity of ${item.name}`}
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>

        <span className="w-24 text-right text-sm font-bold text-white">
          {formatINR(lineTotalPaise / 100)}
        </span>

        <button
          type="button"
          onClick={() => onRemove(item.productId)}
          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-rose-500/10 hover:text-rose-400"
          aria-label={`Remove ${item.name} from cart`}
          title="Remove item"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}
