import ProductCard from "./ProductCard";
import EmptyState from "../common/EmptyState";
import { SkeletonGrid } from "../common/Skeleton";

/**
 * Responsive product grid with loading and empty states.
 * @param {{products: any[], loading?: boolean, onAddToCart?: Function, emptyMessage?: string}} props
 */
export default function ProductGrid({
  products,
  loading = false,
  onAddToCart,
  emptyTitle = "No products found",
  emptyMessage = "Try adjusting your search or filters.",
}) {
  if (loading) return <SkeletonGrid />;

  if (!products?.length) {
    return <EmptyState title={emptyTitle} message={emptyMessage} />;
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product._id}
          product={product}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
}
