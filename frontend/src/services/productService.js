import { call, ENDPOINTS } from "./api";

/**
 * /api/products service.
 * Verified against backend/routes/productRoutes.js and controllers/productController.js.
 *
 * The backend exposes NO search / filter / sort / pagination support:
 * `getProducts` simply runs `Product.find()` with no query handling. Any
 * searching, category filtering or sorting in the UI is therefore applied
 * client-side over this full list.
 */

/** GET /api/products -> 200 Product[] */
export const list = (signal) => call(ENDPOINTS.listProducts, { signal });

/** GET /api/products/:id -> 200 Product | 404 */
export const getById = (id, signal) =>
  call(ENDPOINTS.getProduct, { pathParams: { id }, signal });

/**
 * POST /api/products (admin, multipart/form-data)
 *
 * The backend uses `multer({ dest: 'uploads/' })` with the field name
 * `image`, then uploads that file to Cloudinary and stores
 * `result.secure_url` in `imageURLs`.
 *
 * @param {{name: string, description: string, price: number|string, category: string, stock: number|string, image?: File}} payload
 */
export const create = (payload) => {
  const formData = new FormData();
  formData.append("name", payload.name);
  formData.append("description", payload.description);
  formData.append("price", String(payload.price));
  formData.append("category", payload.category);
  formData.append("stock", String(payload.stock));
  if (payload.image) formData.append("image", payload.image);
  return call(ENDPOINTS.createProduct, { data: formData });
};

/**
 * PUT /api/products/:id (admin, multipart/form-data)
 * The image field is optional: when omitted the existing image is kept.
 *
 * @param {string} id
 * @param {{name: string, description: string, price: number|string, category: string, stock: number|string, image?: File}} payload
 */
export const update = (id, payload) => {
  const formData = new FormData();
  formData.append("name", payload.name);
  formData.append("description", payload.description);
  formData.append("price", String(payload.price));
  formData.append("category", payload.category);
  formData.append("stock", String(payload.stock));
  if (payload.image) formData.append("image", payload.image);
  return call(ENDPOINTS.updateProduct, { pathParams: { id }, data: formData });
};

/** DELETE /api/products/:id (admin) -> 200 { message } */
export const remove = (id) =>
  call(ENDPOINTS.deleteProduct, { pathParams: { id } });
