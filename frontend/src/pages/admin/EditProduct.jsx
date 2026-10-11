import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

import * as productService from "../../services/productService";
import { ENDPOINTS } from "../../utils/endpoints";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import BackendNote from "../../components/common/BackendNote";
import ErrorState from "../../components/common/ErrorState";
import Loader from "../../components/common/Loader";
import ProductForm from "../../components/admin/ProductForm";

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useDocumentTitle(product ? `Edit ${product.name}` : "Edit product");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await productService.getById(id);
        if (!cancelled) setProduct(data);
      } catch (err) {
        if (!cancelled) {
          setError(
            err.status === 404 || err.status === 500
              ? "We could not load this product. It may have been deleted."
              : err.message
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    try {
      await productService.update(id, payload);
      toast.success("Product updated");
      navigate("/admin/products");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader label="Loading product" />;

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={() => window.location.reload()}
        retryLabel="Reload"
      />
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        to="/admin/products"
        className="mb-5 inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to products
      </Link>

      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Edit product
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Leave the image unchanged to keep the current one, or upload a
          replacement.
        </p>
      </header>

      <ProductForm
        endpoint={ENDPOINTS.updateProduct}
        endpointOptions={{ pathParams: { id } }}
        submitLabel="Save changes"
        submitting={submitting}
        initialValues={product}
        onSubmit={handleSubmit}
        knownIssue={
          <BackendNote title="Update behaviour note">
            <p>
              <code className="font-mono text-[11px]">PUT /api/products/:id</code>{" "}
              updates fields and replaces the image only when a new file is
              uploaded. It returns 500 (not 404) when the id does not exist,
              because the controller dereferences a null product.
            </p>
          </BackendNote>
        }
      />
    </div>
  );
}
