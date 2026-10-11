/** Shimmering placeholder block used to build loading skeletons. */
export function SkeletonBlock({ className = "" }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />;
}

/** Product-card shaped skeleton for grids. */
export function SkeletonCard() {
  return (
    <div className="glass overflow-hidden rounded-2xl" aria-hidden="true">
      <SkeletonBlock className="h-48 w-full rounded-none" />
      <div className="space-y-3 p-4">
        <SkeletonBlock className="h-4 w-3/4" />
        <SkeletonBlock className="h-3 w-1/2" />
        <SkeletonBlock className="h-8 w-full" />
      </div>
    </div>
  );
}

/** Grid of product-card skeletons. */
export function SkeletonGrid({ count = 8 }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
}

/** Row shaped skeleton for list/table loading states. */
export function SkeletonRow({ count = 4 }) {
  return (
    <div className="space-y-3" aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonBlock key={index} className="h-16 w-full rounded-xl" />
      ))}
    </div>
  );
}
