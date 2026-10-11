import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PackagePlus, Pencil, RefreshCw, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import * as productService from "../../services/productService";
import { ENDPOINTS } from "../../utils/endpoints";
import { formatINR } from "../../utils/currency";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import ApiEndpointLabel from "../../components/common/ApiEndpointLabel";
import BackendNote from "../../components/common/BackendNote";
import Button from "../../components/common/Button";
import EmptyState from "../../components/common/EmptyState";
import ErrorState from "../../components/common/ErrorState";
import Modal from "../../components/common/Modal";
import { SkeletonRow } from "../../components/common/Skeleton";

export default function AdminProducts() {
  useDocumentTitle("Manage products");

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadProducts = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleDelete = async () => {
    if (!pendingDelete || deleting) return;
    setDeleting(true);
    try {
      await productService.remove(pendingDelete._id);
      toast.success(`"${pendingDelete.name}" deleted`);
      setPendingDelete(null);
      loadProducts();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Products</h1>
          <p className="mt-1 text-sm text-slate-400">
            {loading ? "Loading…" : `${products.length} product${products.length === 1 ? "" : "s"} in the catalogue`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <ApiEndpointLabel
            endpoint={ENDPOINTS.listProducts}
            description={ENDPOINTS.listProducts.description}
          />
          <button
            type="button"
            onClick={loadProducts}
            className="btn btn-ghost text-xs"
            aria-label="Refresh products"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            Refresh
          </button>
          <Link to="/admin/products/new" className="btn btn-primary">
            <PackagePlus className="h-4 w-4" aria-hidden="true" />
            New product
          </Link>
        </div>
      </header>

      <BackendNote title="Product create & delete are broken server-side">
        <p>
          <code className="font-mono text-[11px]">POST /api/products</code> always
          returns 500: <code className="font-mono text-[11px]">createProduct</code>{" "}
          destructures <code className="font-mono text-[11px]">catagory</code> but
          references an undefined <code className="font-mono text-[11px]">category</code>.
        </p>
        <p>
          <code className="font-mono text-[11px]">DELETE /api/products/:id</code>{" "}
          also returns 500 on mongoose 9 because it calls the removed{" "}
          <code className="font-mono text-[11px]">product.remove()</code> method.
          The UI below sends the correct requests and surfaces the server's
          response verbatim.
        </p>
      </BackendNote>

      <div className="mt-6">
        {loading && <SkeletonRow count={5} />}

        {!loading && error && <ErrorState message={error} onRetry={loadProducts} />}

        {!loading && !error && products.length === 0 && (
          <EmptyState
            title="No products yet"
            message="Create the first product to populate the storefront."
            action={
              <Link to="/admin/products/new" className="btn btn-primary">
                Create a product
              </Link>
            }
          />
        )}

        {!loading && !error && products.length > 0 && (
          <div className="glass overflow-hidden rounded-2xl">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[46rem] text-left text-sm">
                <thead className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wider text-slate-400">
                  <tr>
                    <th scope="col" className="px-4 py-3">Product</th>
                    <th scope="col" className="px-4 py-3">Category</th>
                    <th scope="col" className="px-4 py-3">Price</th>
                    <th scope="col" className="px-4 py-3">Stock</th>
                    <th scope="col" className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {products.map((product) => (
                    <tr key={product._id} className="transition-colors hover:bg-white/[0.03]">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-night-800">
                            {product.imageURLs ? (
                              <img
                                src={product.imageURLs}
                                alt=""
                                className="h-full w-full object-cover"
                                loading="lazy"
                              />
                            ) : null}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-white">
                              {product.name}
                            </p>
                            <p className="truncate text-xs text-slate-500" title={product._id}>
                              {product._id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {product.category || "—"}
                      </td>
                      <td className="px-4 py-3 font-semibold text-white">
                        {formatINR(product.price)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                            Number(product.stock) > 0
                              ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-300"
                              : "border-rose-400/30 bg-rose-500/10 text-rose-300"
                          }`}
                        >
                          {Number(product.stock) || 0}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Link
                            to={`/admin/products/edit/${product._id}`}
                            className="rounded-lg border border-white/10 bg-white/5 p-2 text-slate-300 transition-colors hover:border-iris-400/50 hover:text-white"
                            aria-label={`Edit ${product.name}`}
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" aria-hidden="true" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setPendingDelete(product)}
                            className="rounded-lg border border-white/10 bg-white/5 p-2 text-slate-300 transition-colors hover:border-rose-400/50 hover:text-rose-300"
                            aria-label={`Delete ${product.name}`}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirmation */}
      <Modal
        open={Boolean(pendingDelete)}
        onClose={() => !deleting && setPendingDelete(null)}
        title="Delete product"
        labelledBy="delete-product-title"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setPendingDelete(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={deleting}>
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Delete
            </Button>
          </>
        }
      >
        <p>
          You are about to permanently delete{" "}
          <strong className="text-white">{pendingDelete?.name}</strong>. This cannot
          be undone.
        </p>
        <div className="mt-4">
          <ApiEndpointLabel
            endpoint={ENDPOINTS.deleteProduct}
            pathParams={{ id: pendingDelete?._id }}
          />
        </div>
      </Modal>
    </div>
  );
}
