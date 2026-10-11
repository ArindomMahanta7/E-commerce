import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

import * as productService from "../../services/productService";
import { ENDPOINTS } from "../../utils/endpoints";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import BackendNote from "../../components/common/BackendNote";
import ProductForm from "../../components/admin/ProductForm";

export default function CreateProduct() {
  useDocumentTitle("New product");

  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (payload) => {
    setSubmitting(true);
    try {
      // multipart/form-data with the image in a field named "image".
      await productService.create(payload);
      toast.success("Product created");
      navigate("/admin/products");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

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
          Create product
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Fields match the backend Product schema; the image is uploaded through
          the API to Cloudinary.
        </p>
      </header>

      <ProductForm
        endpoint={ENDPOINTS.createProduct}
        submitLabel="Create product"
        submitting={submitting}
        onSubmit={handleSubmit}
        knownIssue={
          <BackendNote title="This endpoint is currently broken server-side">
            <p>
              <code className="font-mono text-[11px]">POST /api/products</code>{" "}
              returns <strong>500 "Error creating product"</strong> for every
              request: the controller destructures{" "}
              <code className="font-mono text-[11px]">catagory</code> but then
              passes an undefined{" "}
              <code className="font-mono text-[11px]">category</code> into{" "}
              <code className="font-mono text-[11px]">new Product()</code>. The
              form below sends the correct multipart request - the backend needs a
              one-line fix before this succeeds.
            </p>
          </BackendNote>
        }
      />
    </div>
  );
}
