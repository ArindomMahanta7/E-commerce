import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Minus, Plus, ShoppingBag, Zap } from "lucide-react";
import toast from "react-hot-toast";

import * as productService from "../services/productService";
import { ENDPOINTS } from "../utils/endpoints";
import { formatINR } from "../utils/currency";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { useCart } from "../context/CartContext";
import ApiEndpointLabel from "../components/common/ApiEndpointLabel";
import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import ErrorState from "../components/common/ErrorState";
import Loader from "../components/common/Loader";
import ProductCard from "../components/products/ProductCard";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const loadProduct = async () => {
    setLoading(true);
    setError(null);
    setQuantity(1);
    try {
      const data = await productService.getById(id);
      setProduct(data);

      /* Related products: filtered client-side by category (the backend has
         no category query support) from the public product list. */
      try {
        const all = await productService.list();
        setRelated(
          (Array.isArray(all) ? all : [])
            .filter(
              (item) =>
                item?._id !== data?._id &&
                String(item?.category ?? "") === String(data?.category ?? "") &&
                String(data?.category ?? "") !== ""
            )
            .slice(0, 4)
        );
      } catch {
        setRelated([]);
      }
    } catch (err) {
      if (err.status === 404) {
        setError("This product does not exist or has been removed.");
      } else if (err.status === 500) {
        // The backend returns 500 (not 404) for malformed ObjectIds because
        // getProductById catches CastErrors, so treat both as "not found".
        setError("We could not find that product. The link may be invalid.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useDocumentTitle(product?.name ?? "Product");

  const stock = Number(product?.stock) || 0;
  const outOfStock = stock <= 0;
  const maxQuantity = Math.max(stock, 1);

  const notFound = Boolean(error && !product && !loading);

  const handleAddToCart = () => {
    addItem(product, quantity);
    toast.success(`${quantity} × ${product.name} added to cart`);
  };

  const handleBuyNow = () => {
    addItem(product, quantity);
    navigate("/cart");
  };

  const relatedTitle = useMemo(
    () => (product?.category ? `More in ${product.category}` : "You may also like"),
    [product]
  );

  if (loading) return <Loader label="Loading product" />;

  if (notFound) {
    return (
      <EmptyState
        title="Product not found"
        message={error}
        action={
          <Link to="/shop" className="btn btn-primary">
            Back to shop
          </Link>
        }
      />
    );
  }

  if (error && !product) {
    return <ErrorState message={error} onRetry={loadProduct} />;
  }

  return (
    <div className="space-y-14">
      <div>
        <Link
          to="/shop"
          className="mb-5 inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to shop
        </Link>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="glass overflow-hidden rounded-3xl bg-night-800"
          >
            {product.imageURLs ? (
              <img
                src={product.imageURLs}
                alt={product.name}
                className="aspect-square w-full object-cover"
              />
            ) : (
              <div className="flex aspect-square w-full items-center justify-center text-slate-500">
                <ShoppingBag className="h-16 w-16" aria-hidden="true" />
              </div>
            )}
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08 }}
            className="glass-strong flex flex-col rounded-3xl p-6 sm:p-8"
          >
            {product.category && (
              <span className="mb-3 w-fit rounded-full border border-iris-400/30 bg-iris-500/10 px-3 py-1 text-xs font-semibold text-iris-300">
                {product.category}
              </span>
            )}

            <h1 className="text-2xl font-bold leading-tight text-white sm:text-3xl">
              {product.name}
            </h1>

            <p className="mt-4 text-3xl font-extrabold text-white">
              {formatINR(product.price)}
            </p>

            <p className="mt-4 text-sm leading-relaxed text-slate-300">
              {product.description}
            </p>

            <p className="mt-4 text-sm">
              {outOfStock ? (
                <span className="font-semibold text-rose-300">Out of stock</span>
              ) : stock <= 5 ? (
                <span className="font-semibold text-amber-300">
                  Only {stock} left in stock
                </span>
              ) : (
                <span className="text-emerald-300">In stock · {stock} available</span>
              )}
            </p>

            {/* Quantity */}
            <div className="mt-6">
              <span id="quantity-label" className="label-glass">
                Quantity
              </span>
              <div className="flex w-fit items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1.5">
                <button
                  type="button"
                  onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                  disabled={quantity <= 1 || outOfStock}
                  className="rounded-lg p-2 text-slate-300 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-40"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" aria-hidden="true" />
                </button>
                <span
                  className="w-12 text-center text-sm font-bold text-white"
                  aria-live="polite"
                >
                  {outOfStock ? 0 : quantity}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((current) => Math.min(maxQuantity, current + 1))
                  }
                  disabled={outOfStock || quantity >= maxQuantity}
                  className="rounded-lg p-2 text-slate-300 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-40"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Actions (client-side only, so no API label is shown) */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button
                onClick={handleAddToCart}
                disabled={outOfStock}
                className="flex-1"
              >
                <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                Add to cart
              </Button>
              <Button
                variant="accent"
                onClick={handleBuyNow}
                disabled={outOfStock}
                className="flex-1"
              >
                <Zap className="h-4 w-4" aria-hidden="true" />
                Buy now
              </Button>
            </div>

            <p className="mt-4 text-xs text-slate-500">
              Adding to the cart is stored in your browser only. Payment and order
              creation happen at checkout.
            </p>
          </motion.div>
        </div>

        <ApiEndpointLabel
          endpoint={ENDPOINTS.getProduct}
          pathParams={{ id }}
          description="This page's product data"
          className="mt-5"
        />
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <section aria-labelledby="related-heading">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 id="related-heading" className="text-xl font-bold text-white">
              {relatedTitle}
            </h2>
            <ApiEndpointLabel
              endpoint={ENDPOINTS.listProducts}
              description="Related products are filtered client-side from this list"
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard
                key={item._id}
                product={item}
                onAddToCart={(product) => {
                  addItem(product, 1);
                  toast.success(`${product.name} added to cart`);
                }}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
