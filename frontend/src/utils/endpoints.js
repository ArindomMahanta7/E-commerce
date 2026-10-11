/**
 * Single source of truth for every backend endpoint this frontend talks to.
 *
 * Every route below was verified against the backend source code:
 *   backend/routes/*.js, backend/controllers/*.js, backend/index.js
 *
 * The SAME descriptor objects are used to (a) perform the Axios request and
 * (b) render the `ApiEndpointLabel` shown above action buttons. That is what
 * guarantees the URL displayed in the UI can never drift from the request
 * actually sent over the network.
 *
 * Verified route inventory (backend/index.js mounts all five routers):
 *   /api/auth      -> routes/authRoutes.js
 *   /api/products  -> routes/productRoutes.js
 *   /api/orders    -> routes/orderRoutes.js
 *   /api/payment   -> routes/paymentRoutes.js   (IS mounted)
 *   /api/analytics -> routes/analyticsRoutes.js (IS mounted)
 */

/**
 * Base URL of the backend.
 * backend/index.js: `const port = process.env.PORT || 3000`
 * A trailing slash is stripped; "/api" is never appended here because every
 * descriptor path already starts with "/api".
 */
const RAW_BASE =
  (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000").trim();

export const API_BASE_URL = RAW_BASE.replace(/\/+$/, "");

/**
 * Query parameters that must never be echoed into the UI or a URL bar.
 * (Defence-in-depth: this app never places secrets in query strings, but the
 * label component sanitises anyway so a future mistake cannot leak a token.)
 */
const SENSITIVE_QUERY_KEYS = [
  "token",
  "authorization",
  "password",
  "otp",
  "secret",
  "key_secret",
  "api_secret",
];

const sanitizeQueryValue = (key, value) =>
  SENSITIVE_QUERY_KEYS.includes(String(key).toLowerCase())
    ? "[redacted]"
    : value;

/**
 * Builds the fully resolved request URL for an endpoint descriptor.
 * @param {{path: string}} endpoint
 * @param {{pathParams?: Record<string, string|number>, params?: Record<string, any>}} options
 */
export const buildEndpointUrl = (endpoint, { pathParams, params } = {}) => {
  const interpolated = endpoint.path.replace(/:(\w+)/g, (_, key) => {
    const value = pathParams?.[key];
    if (value === undefined || value === null || value === "") {
      throw new Error(
        `Missing path parameter "${key}" required by ${endpoint.method} ${endpoint.path}`
      );
    }
    return encodeURIComponent(String(value));
  });

  const search = new URLSearchParams();
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    search.append(key, sanitizeQueryValue(key, value));
  });

  const queryString = search.toString();
  return `${API_BASE_URL}${interpolated}${queryString ? `?${queryString}` : ""}`;
};

/**
 * Resolves the `{ method, url }` pair used by <ApiEndpointLabel/>.
 * The returned object is exactly what Axios is instructed to call.
 */
export const describeEndpoint = (endpoint, options = {}) => ({
  method: endpoint.method,
  url: buildEndpointUrl(endpoint, options),
  requiresAuth: Boolean(endpoint.requiresAuth),
  adminOnly: Boolean(endpoint.adminOnly),
});

/**
 * All verified backend endpoints.
 *
 * `requiresAuth` controls whether the Axios request interceptor attaches
 * `Authorization: Bearer <JWT>` - public endpoints are deliberately left
 * untouched, as required by the backend's `protect` middleware wiring.
 */
export const ENDPOINTS = {
  // ---- /api/auth (routes/authRoutes.js) ----
  register: {
    method: "POST",
    path: "/api/auth/register",
    requiresAuth: false,
    description: "Register a new account (sends an OTP email)",
  },
  login: {
    method: "POST",
    path: "/api/auth/login",
    requiresAuth: false,
    description: "Log in and receive a 30-day JWT",
  },
  verifyEmail: {
    method: "POST",
    path: "/api/auth/verify_email",
    requiresAuth: false,
    description: "Verify the email address with a 6-digit OTP",
  },
  listUsers: {
    method: "GET",
    path: "/api/auth/users",
    requiresAuth: true,
    adminOnly: true,
    description: "Admin-only list of all users",
  },

  // ---- /api/products (routes/productRoutes.js) ----
  listProducts: {
    method: "GET",
    path: "/api/products",
    requiresAuth: false,
    description: "Public list of every product",
  },
  getProduct: {
    method: "GET",
    path: "/api/products/:id",
    requiresAuth: false,
    description: "Public single-product lookup",
  },
  createProduct: {
    method: "POST",
    path: "/api/products",
    requiresAuth: true,
    adminOnly: true,
    description: "Admin: create product (multipart/form-data, field 'image')",
  },
  updateProduct: {
    method: "PUT",
    path: "/api/products/:id",
    requiresAuth: true,
    adminOnly: true,
    description: "Admin: update product (multipart/form-data, field 'image')",
  },
  deleteProduct: {
    method: "DELETE",
    path: "/api/products/:id",
    requiresAuth: true,
    adminOnly: true,
    description: "Admin: delete a product",
  },

  // ---- /api/orders (routes/orderRoutes.js) ----
  createOrder: {
    method: "POST",
    path: "/api/orders",
    requiresAuth: true,
    description: "Create an order after successful payment verification",
  },
  myOrders: {
    method: "GET",
    path: "/api/orders/myorders",
    requiresAuth: true,
    description: "Orders belonging to the logged-in user",
  },
  listAllOrders: {
    method: "GET",
    path: "/api/orders",
    requiresAuth: true,
    adminOnly: true,
    description: "Admin: every order, with customer details",
  },
  updateOrderStatus: {
    method: "PUT",
    path: "/api/orders/:id/status",
    requiresAuth: true,
    adminOnly: true,
    description: "Admin: update an order's status",
  },

  // ---- /api/payment (routes/paymentRoutes.js - mounted in backend/index.js) ----
  createPaymentOrder: {
    method: "POST",
    path: "/api/payment/order",
    requiresAuth: false,
    description: "Create a Razorpay payment order (amount in INR rupees)",
  },
  verifyPayment: {
    method: "POST",
    path: "/api/payment/verify",
    requiresAuth: false,
    description: "Verify the Razorpay signature server-side",
  },

  // ---- /api/analytics (routes/analyticsRoutes.js - mounted in backend/index.js) ----
  analytics: {
    method: "GET",
    path: "/api/analytics",
    requiresAuth: true,
    adminOnly: true,
    description: "Admin: totals for orders, products, users and revenue",
  },
};
