import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

import * as productService from "../services/productService";
import { ENDPOINTS } from "../utils/endpoints";
import { toPaise } from "../utils/currency";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { useCart } from "../context/CartContext";
import ApiEndpointLabel from "../components/common/ApiEndpointLabel";
import ErrorState from "../components/common/ErrorState";
import ProductGrid from "../components/products/ProductGrid";

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name-asc", label: "Name: A to Z" },
  { value: "newest", label: "Newest first" },
];

export default function Shop() {
  useDocumentTitle("Shop");

  const { addItem } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sort, setSort] = useState("featured");

  const query = searchParams.get("q") ?? "";
  const category = searchParams.get("category") ?? "";

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

  const categories = useMemo(
    () =>
      [
        ...new Set(
          products.map((p) => String(p?.category ?? "").trim()).filter(Boolean)
        ),
      ].sort((a, b) => a.localeCompare(b)),
    [products]
  );

  /**
   * The backend's getProducts runs a plain `Product.find()` with no query
   * handling, so search, category filtering and sorting are applied here on
   * the client over the full fetched catalogue.
   */
  const visibleProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const filtered = products.filter((product) => {
      const matchesQuery =
        !normalizedQuery ||
        String(product?.name ?? "").toLowerCase().includes(normalizedQuery) ||
        String(product?.description ?? "").toLowerCase().includes(normalizedQuery);

      const matchesCategory =
        !category ||
        String(product?.category ?? "").trim().toLowerCase() ===
          category.trim().toLowerCase();

      return matchesQuery && matchesCategory;
    });

    const sorted = [...filtered];
    switch (sort) {
      case "price-asc":
        sorted.sort((a, b) => toPaise(a?.price) - toPaise(b?.price));
        break;
      case "price-desc":
        sorted.sort((a, b) => toPaise(b?.price) - toPaise(a?.price));
        break;
      case "name-asc":
        sorted.sort((a, b) => String(a?.name).localeCompare(String(b?.name)));
        break;
      case "newest":
        sorted.sort(
          (a, b) =>
            new Date(b?.createdAt ?? 0).getTime() -
            new Date(a?.createdAt ?? 0).getTime()
        );
        break;
      default:
        break;
    }

    return sorted;
  }, [products, query, category, sort]);

  const handleAddToCart = (product) => {
    addItem(product, 1);
    toast.success(`${product.name} added to cart`);
  };

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next, { replace: true });
  };

  const hasActiveFilters = Boolean(query || category);

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {category ? category : "All products"}
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          {loading
            ? "Loading the catalogue…"
            : `${visibleProducts.length} of ${products.length} product${products.length === 1 ? "" : "s"}`}
        </p>
      </header>

      <ApiEndpointLabel
        endpoint={ENDPOINTS.listProducts}
        description={ENDPOINTS.listProducts.description}
        className="mb-5"
      />

      {/* Filters */}
      <div className="glass mb-6 flex flex-col gap-3 rounded-2xl p-4 lg:flex-row lg:items-end">
        <div className="flex-1">
          <label htmlFor="shop-search" className="label-glass">
            Search
          </label>
          <input
            id="shop-search"
            type="search"
            value={query}
            onChange={(event) => updateParam("q", event.target.value)}
            placeholder="Search by name or description…"
            className="input-glass"
          />
        </div>

        <div className="lg:w-56">
          <label htmlFor="shop-category" className="label-glass">
            Category
          </label>
          <select
            id="shop-category"
            value={category}
            onChange={(event) => updateParam("category", event.target.value)}
            className="input-glass"
          >
            <option value="">All categories</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="lg:w-56">
          <label htmlFor="shop-sort" className="label-glass">
            Sort by
          </label>
          <select
            id="shop-sort"
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            className="input-glass"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => setSearchParams({}, { replace: true })}
            className="btn btn-ghost shrink-0 text-xs"
          >
            Clear filters
          </button>
        )}
      </div>

      {error ? (
        <ErrorState message={error} onRetry={loadProducts} />
      ) : (
        <ProductGrid
          products={visibleProducts}
          loading={loading}
          onAddToCart={handleAddToCart}
          emptyTitle={hasActiveFilters ? "No matching products" : "No products yet"}
          emptyMessage={
            hasActiveFilters
              ? "Try a different search term or clear the filters."
              : "The catalogue is empty. Administrators can add products from the admin dashboard."
          }
        />
      )}
    </div>
  );
}
