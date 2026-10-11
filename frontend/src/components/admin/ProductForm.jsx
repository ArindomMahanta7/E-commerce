import { useState } from "react";
import { ImagePlus, X } from "lucide-react";

import ApiEndpointLabel from "../common/ApiEndpointLabel";
import Button from "../common/Button";

/**
 * Shared create/edit product form.
 *
 * The backend's product controller expects `multipart/form-data` with the
 * image in a field literally named `image` (multer: upload.single('image')),
 * uploaded through the API to Cloudinary - never directly from the browser.
 */
export default function ProductForm({
  endpoint,
  endpointOptions,
  submitLabel,
  initialValues,
  onSubmit,
  submitting,
  knownIssue,
}) {
  const [form, setForm] = useState({
    name: initialValues?.name ?? "",
    description: initialValues?.description ?? "",
    price: initialValues?.price ?? "",
    category: initialValues?.category ?? "",
    stock: initialValues?.stock ?? "",
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(
    initialValues?.imageURLs ?? null
  );
  const [errors, setErrors] = useState({});

  const handleChange = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0] ?? null;
    if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    setImage(file);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const clearImage = () => {
    if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    setImage(null);
    setImagePreview(null);
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = "Name is required.";
    if (!form.description.trim())
      nextErrors.description = "Description is required.";
    if (form.price === "" || Number(form.price) < 0 || Number.isNaN(Number(form.price))) {
      nextErrors.price = "Enter a valid price.";
    }
    if (!form.category.trim()) nextErrors.category = "Category is required.";
    if (
      form.stock === "" ||
      Number.isNaN(Number(form.stock)) ||
      Number(form.stock) < 0 ||
      !Number.isInteger(Number(form.stock))
    ) {
      nextErrors.stock = "Stock must be a whole number of 0 or more.";
    }
    return nextErrors;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSubmit({
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      category: form.category.trim(),
      stock: Number(form.stock),
      image,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {knownIssue}

      <div className="glass rounded-2xl p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="product-name" className="label-glass">
              Product name
            </label>
            <input
              id="product-name"
              className="input-glass"
              value={form.name}
              onChange={handleChange("name")}
              aria-invalid={Boolean(errors.name)}
              required
            />
            {errors.name && (
              <p className="mt-1 text-xs text-rose-300">{errors.name}</p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="product-description" className="label-glass">
              Description
            </label>
            <textarea
              id="product-description"
              rows={4}
              className="input-glass resize-y"
              value={form.description}
              onChange={handleChange("description")}
              aria-invalid={Boolean(errors.description)}
              required
            />
            {errors.description && (
              <p className="mt-1 text-xs text-rose-300">{errors.description}</p>
            )}
          </div>

          <div>
            <label htmlFor="product-price" className="label-glass">
              Price (INR)
            </label>
            <input
              id="product-price"
              type="number"
              min="0"
              step="0.01"
              className="input-glass"
              value={form.price}
              onChange={handleChange("price")}
              aria-invalid={Boolean(errors.price)}
              required
            />
            {errors.price && (
              <p className="mt-1 text-xs text-rose-300">{errors.price}</p>
            )}
          </div>

          <div>
            <label htmlFor="product-stock" className="label-glass">
              Stock
            </label>
            <input
              id="product-stock"
              type="number"
              min="0"
              step="1"
              className="input-glass"
              value={form.stock}
              onChange={handleChange("stock")}
              aria-invalid={Boolean(errors.stock)}
              required
            />
            {errors.stock && (
              <p className="mt-1 text-xs text-rose-300">{errors.stock}</p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="product-category" className="label-glass">
              Category
            </label>
            <input
              id="product-category"
              className="input-glass"
              value={form.category}
              onChange={handleChange("category")}
              placeholder="e.g. Electronics"
              aria-invalid={Boolean(errors.category)}
              required
            />
            {errors.category && (
              <p className="mt-1 text-xs text-rose-300">{errors.category}</p>
            )}
          </div>
        </div>
      </div>

      {/* Image upload (multipart, field name "image") */}
      <div className="glass rounded-2xl p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
          Product image
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          The file is sent to the backend as{" "}
          <code className="font-mono">multipart/form-data</code> and uploaded to
          Cloudinary server-side. Direct browser uploads to Cloudinary are never
          used, so no secret key touches this app.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-4">
          {imagePreview ? (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Selected product"
                className="h-28 w-28 rounded-xl border border-white/10 object-cover"
              />
              <button
                type="button"
                onClick={clearImage}
                className="absolute -right-2 -top-2 rounded-full border border-white/15 bg-night-800 p-1.5 text-slate-300 hover:bg-rose-500/20 hover:text-rose-300"
                aria-label="Remove selected image"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          ) : (
            <div className="flex h-28 w-28 items-center justify-center rounded-xl border border-dashed border-white/15 bg-white/5 text-slate-500">
              <ImagePlus className="h-7 w-7" aria-hidden="true" />
            </div>
          )}

          <div>
            <label htmlFor="product-image" className="btn btn-outline cursor-pointer">
              <ImagePlus className="h-4 w-4" aria-hidden="true" />
              {imagePreview ? "Replace image" : "Choose image"}
            </label>
            <input
              id="product-image"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleImageChange}
            />
            <p className="mt-2 text-xs text-slate-500">
              {image ? image.name : "PNG, JPG or WEBP."}
            </p>
          </div>
        </div>
      </div>

      {/* The exact request the button below sends */}
      <ApiEndpointLabel
        endpoint={endpoint}
        pathParams={endpointOptions?.pathParams}
        description={endpoint.description}
      />

      <Button type="submit" loading={submitting} className="px-8 py-3">
        {submitLabel}
      </Button>
    </form>
  );
}
