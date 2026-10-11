# ShopNest — Frontend / Backend Integration Report

Date: 2026-10-11 · Frontend: `./frontend` (Vite + React 19 + Tailwind v4) · Backend: `./backend` (Express 5 + Mongoose 9)

This report documents what was built, what was verified against the backend source, and every
gap that was found. Nothing here is simulated — every claim was read from the code.

---

## 1. What was delivered

| Deliverable | Location |
| --- | --- |
| Complete frontend source | `frontend/src/**` |
| Reusable API endpoint label | `frontend/src/components/common/ApiEndpointLabel.jsx` |
| Centralised endpoint registry (single source of truth) | `frontend/src/utils/endpoints.js` |
| Centralised Axios config + interceptors | `frontend/src/services/api.js` |
| Service modules (auth, products, orders, payment, analytics) | `frontend/src/services/*.js` |
| Glassmorphism design system | `frontend/src/index.css` |
| Customer pages | Home, Shop, ProductDetails, Cart, Checkout, OrderSuccess, MyOrders, Profile, Login, Register, VerifyEmail, NotFound |
| Admin pages | Dashboard (overview), Products, CreateProduct, EditProduct, Orders, Users |
| Route guards | `ProtectedRoute`, `AdminRoute` |
| Env example | `frontend/.env.example` |
| Setup docs | `frontend/README.md` |

**Verified working at build time:** `npm run build` succeeds (440 kB main chunk / 134 kB gzip,
admin section code-split). Dev server (`npm run dev`) serves and transforms every module without
errors.

---

## 2. Backend endpoints successfully integrated

All 16 routes were read from `backend/routes/*.js`, `backend/controllers/*.js` and
`backend/index.js`. **All five routers — including `/api/payment` and `/api/analytics` — are
mounted** in `backend/index.js`, contrary to the earlier report that payment/analytics were
unmounted.

| Method | Path | Frontend usage |
| --- | --- | --- |
| POST | `/api/auth/register` | Register page |
| POST | `/api/auth/login` | Login page (+ role probe) |
| POST | `/api/auth/verify_email` | VerifyEmail page |
| GET | `/api/auth/users` | Admin → Users |
| GET | `/api/products` | Home, Shop, ProductDetails, Checkout validation |
| GET | `/api/products/:id` | ProductDetails, Admin edit form |
| POST | `/api/products` | Admin create (multipart, field `image`) |
| PUT | `/api/products/:id` | Admin edit (multipart, field `image`) |
| DELETE | `/api/products/:id` | Admin delete modal |
| POST | `/api/orders` | Checkout (after payment verification) |
| GET | `/api/orders/myorders` | My Orders |
| GET | `/api/orders` | Admin → Orders |
| PUT | `/api/orders/:id/status` | Admin order status advance |
| POST | `/api/payment/order` | Checkout step 1 |
| POST | `/api/payment/verify` | Checkout step 4 |
| GET | `/api/analytics` | Admin overview (also used for role detection) |

Payload shapes were taken from the controllers/validators, not assumed. Examples:

- Order creation sends `products: { product, quantity, price }`, `totalAmount`, `address:
  { fullname, street, city, state }`, `paymentId` — exactly the fields `addOrderItems` checks.
- Product create/update sends `multipart/form-data` with the file in the field name `image`
  (`multer({ dest: 'uploads/' }).single('image')`).
- `/api/payment/order` receives `amount` in **rupees** because the controller does `× 100`.

---

## 3. Backend defects found (NOT fixed — per instruction to keep the backend untouched)

These make real user flows fail server-side. The frontend sends the correct request, shows the
server's own error message, and displays a `BackendNote` banner on the affected screens. No
success is ever faked.

| # | Endpoint | Defect (verified) | Consequence |
| --- | --- | --- | --- |
| 1 | `POST /api/products` | `createProduct` destructures `catagory` from the body but passes an undefined `category` identifier into `new Product()` → `ReferenceError` → always **500 "Error creating product"** | Product creation always fails. One-line fix: destructure `category`. |
| 2 | `DELETE /api/products/:id` | `deleteProduct` calls `product.remove()`; confirmed absent on `Document.prototype` in the installed mongoose **9.11.1** → always **500** | Product deletion always fails. Fix: `await product.deleteOne()`. |
| 3 | `POST /api/orders` | `addOrderItems` validates `products` then passes an undefined `items` identifier into `new Order()` → always **500 "Internal server error"** | Order creation always fails. Fix: pass `products`. |
| 4 | `POST /api/orders` (secondary) | `sendEmail({ to, subject, text })` is called with one object, but `utils/sendEmail.js` has signature `(to, subject, text)` | Would fail even after fixing #3. Fix: `sendEmail(req.user.email, "order created successfully", ...)`. |
| 5 | `model/orders.js` | `products` is a **single** embedded document `{ product, quantity, price }`, not an array, while the controller validates `products.length === 0` (array intent) | One order row = one product line. Frontend issues one `POST /api/orders` per cart line sharing one `paymentId`. |
| 6 | `PUT /api/products/:id` | Dereferences `product` before the null check → a bad id returns **500** instead of 404 | Frontend maps 404/500 on this route to a "product not found" state. |
| 7 | `GET /api/orders/:id` | `getOrdersById` is exported but **never mounted**, and its `findById({user})` filter is wrong | No order-detail page is offered. |
| 8 | OTP resend | No resend route exists, and re-registering returns 400 "User already exists" | A lost OTP currently cannot be recovered. VerifyEmail states this. |
| 9 | Profile | No `/api/auth/me`; login response has no `role` and no `verified` flag | Role is resolved by calling the admin-only `GET /api/analytics` (200 → admin, 403 → user) and cached locally. Admin authority still rests with the backend middleware. |
| 10 | Search/sort | `getProducts` runs a bare `Product.find()` | Shop search, category filter and sorting are client-side. |
| 11 | Payment float precision | `amount: req.body.amount * 100` on a rupee float can yield non-integer paise (e.g. `299.99 * 100 = 29998.999999999996`) | Razorpay may reject non-integer paise. Backend should accept integer paise or round server-side. |

---

## 4. Environment / configuration gaps

`backend/.env` contains **only `OTP_SECRET`**. Missing (each verified as referenced in code):

| Variable | Referenced in | Blocks |
| --- | --- | --- |
| `MONGO_URI` | `config/db.js` | Server startup (it throws without it) |
| `JWT_SECRET` | `authController`, `authMiddleware` | Login + all protected routes |
| `OTP_SECRET` | `utils/otp.js` | ✅ present — OTP hashing |
| `EMAIL_USER`, `EMAIL_PASS` | `utils/sendEmail.js` | OTP email + order confirmation email |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | `config/cloudinary.js` | Product image uploads |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | `paymentController.js` | Razorpay order creation + verification |
| `PORT` (optional) | `index.js` | Defaults to **3000** — the frontend defaults to `http://localhost:3000` accordingly |

Frontend side: `frontend/.env` needs `VITE_API_BASE_URL` and `VITE_RAZORPAY_KEY_ID` (public key
only; the secret is never used in the browser).

---

## 5. Assumptions made

1. **Backend port = 3000.** `index.js` falls back to 3000 when `PORT` is unset; `VITE_API_BASE_URL`
   defaults to `http://localhost:3000` and is overridable via `.env`.
2. **Cart is frontend-managed.** No `/api/cart` route exists anywhere in the backend, so the cart
   is persisted in `localStorage` and re-validated against `GET /api/products` before ordering.
3. **Role detection via admin probe.** Because no endpoint returns the role, `GET /api/analytics`
   is called after login/session restore: 200 = admin, 403 = user. The request is real, is
   labelled in the Profile page documentation, and never grants access by itself.
4. **JWT in `localStorage`.** The only option that survives reloads with this stateless-token
   backend; the trade-off is documented in `frontend/README.md` and in `utils/storage.js`.
5. **Multi-item checkout = one order per cart line**, sharing one verified Razorpay `paymentId`,
   because the Order schema holds a single product line.
6. **Order dates**: rendered only when `createdAt` is actually present in the response.
7. **Razorpay key id is public** and therefore safe to expose via `VITE_RAZORPAY_KEY_ID`.

---

## 6. Unresolved issues requiring backend changes

1. Fix the four hard defects in section 3 (`catagory`/`category`, `product.remove()`, `items`,
   `sendEmail` signature) — until then, **product create, product delete and order creation
   cannot succeed**.
2. Decide the multi-item order shape: either change `products` to an array (the controller's
   `.length` validation and `populate("products.product")` already support it), or keep
   one-order-per-line.
3. Add an OTP resend endpoint (and allow re-sending for an existing unverified user).
4. Add a `/api/auth/me` endpoint returning `{ id, name, email, role, verified }` so the frontend
   can drop the analytics probe.
5. Add a single-order endpoint (`GET /api/orders/:id`) if an order-detail page is wanted.
6. Add search/filter/sort support to `getProducts` if server-side querying is desired.
7. Send integer paise to Razorpay instead of `rupees * 100`.
8. Populate the remaining backend env vars (section 4) — nothing can be tested end-to-end
   without them.

---

## 7. Explicitly NOT done (to avoid faking functionality)

- No simulated order success: the success page renders only after HTTP 201 from `POST /api/orders`.
- No fake payment confirmation: the order is created only after `POST /api/payment/verify` returns 200.
- No invented endpoints: `/api/cart`, `/api/auth/me`, OTP resend, order-by-id and product search
  do not exist and were not stubbed.
- No direct-to-Cloudinary uploads from the browser; images always go through the API.
- No JWTs, passwords, OTPs or payment secrets in labels, URLs or logs.
- No backend files were modified (per the decision recorded for this task).
