# ShopNest Frontend

A premium, responsive e-commerce frontend built with **Vite + React 19**, styled with a
**Glassmorphism design system** (Tailwind CSS v4), and integrated with the existing
**Express + MongoDB** backend in `../backend`.

Every action that talks to the backend displays the **exact HTTP method + resolved URL**
above its button via a reusable `<ApiEndpointLabel />`. The label and the Axios request are
generated from the **same endpoint descriptor**, so they cannot drift apart.

---

## 1. Quick start

```bash
cd frontend
npm install
cp .env.example .env      # then edit the values
npm run dev               # http://localhost:5173
```

Production build:

```bash
npm run build             # outputs dist/
npm run preview           # serves the production build
```

### Backend prerequisites

The frontend expects the backend to be running (default `http://localhost:3000`):

```bash
cd backend
npm install
npm run dev               # index.js reads PORT, falling back to 3000
```

> ⚠️ The checked-in `backend/.env` currently only contains `OTP_SECRET`. The backend needs
> `MONGO_URI`, `JWT_SECRET`, `PORT` (optional), plus the provider credentials listed in
> section 7 before every flow can succeed end-to-end.

### Environment variables (`.env`)

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_API_BASE_URL` | yes | Backend origin, e.g. `http://localhost:3000`. No trailing slash, no `/api` suffix. |
| `VITE_RAZORPAY_KEY_ID` | for payments | Razorpay **public** key id used by the browser checkout widget. The secret never leaves `backend/.env`. |

---

## 2. Project structure

```
src/
├── assets/
├── components/
│   ├── admin/      ProductForm.jsx
│   ├── cart/       CartItem.jsx
│   ├── common/     ApiEndpointLabel, Button, Loader, Skeleton, Modal,
│   │               EmptyState, ErrorState, BackendNote, StatusBadge, PageHeader
│   ├── layout/     Navbar.jsx, Footer.jsx, AdminSidebar.jsx
│   └── products/   ProductCard.jsx, ProductGrid.jsx
├── context/        AuthContext.jsx, CartContext.jsx
├── hooks/          useDocumentTitle.js
├── layouts/        MainLayout.jsx, AdminLayout.jsx
├── pages/          Home, Shop, ProductDetails, Cart, Checkout, OrderSuccess,
│                   MyOrders, Profile, Login, Register, VerifyEmail, NotFound
│   └── admin/      Dashboard, Products, CreateProduct, EditProduct, Orders, Users
├── routes/         ProtectedRoute.jsx, AdminRoute.jsx
├── services/       api.js, authService, productService, orderService,
│                   paymentService, analyticsService
├── utils/          endpoints.js, apiError.js, currency.js, validators.js,
│                   storage.js, orderShape.js, razorpay.js
├── App.jsx         route table
├── main.jsx        providers + toaster
└── index.css       glassmorphism design system (Tailwind v4 @theme)
```

---

## 3. API integration map

All endpoints were read from the backend source (routes + controllers + models) - none are
assumed. `VITE_API_BASE_URL` is prepended to every path.

### Auth - `backend/routes/authRoutes.js`

| # | Method | Path | Auth | Request | Response |
| --- | --- | --- | --- | --- | --- |
| 1 | POST | `/api/auth/register` | public | `{ name, email, password }` | `201 { id, name, email, message }`, `400/409 { message }` |
| 2 | POST | `/api/auth/login` | public | `{ email, password }` | `200 { id, name, email, token, message }`, `400`, `403` (unverified) |
| 3 | POST | `/api/auth/verify_email` | public | `{ email, otp }` (6 digits) | `200 { message }`, `400/404` |
| 4 | GET | `/api/auth/users` | Bearer + admin | - | `200 User[]` (`-password -otp`) |

### Products - `backend/routes/productRoutes.js`

| # | Method | Path | Auth | Request | Response |
| --- | --- | --- | --- | --- | --- |
| 5 | GET | `/api/products` | public | - | `200 Product[]` |
| 6 | GET | `/api/products/:id` | public | - | `200 Product`, `404` |
| 7 | POST | `/api/products` | Bearer + admin | `multipart/form-data`: `name, description, price, category, stock`, file field **`image`** | `201 Product` |
| 8 | PUT | `/api/products/:id` | Bearer + admin | same as above (`image` optional) | `200 Product` |
| 9 | DELETE | `/api/products/:id` | Bearer + admin | - | `200 { message }`, `404` |

### Orders - `backend/routes/orderRoutes.js`

| # | Method | Path | Auth | Request | Response |
| --- | --- | --- | --- | --- | --- |
| 10 | POST | `/api/orders` | Bearer | `{ products: { product, quantity, price }, totalAmount, address: { fullname, street, city, state }, paymentId }` | `201 { message, order }`, `400` |
| 11 | GET | `/api/orders/myorders` | Bearer | - | `200 { orders: Order[] }` |
| 12 | GET | `/api/orders` | Bearer + admin | - | `200 Order[]` (populated `user`) |
| 13 | PUT | `/api/orders/:id/status` | Bearer + admin | `{ status: "pending"\|"shipped"\|"delivered" }` | `200 { message, order }`, `404` |

### Payment - `backend/routes/paymentRoutes.js` (mounted)

| # | Method | Path | Auth | Request | Response |
| --- | --- | --- | --- | --- | --- |
| 14 | POST | `/api/payment/order` | public | `{ amount }` (rupees; server does `× 100`) | `200 { order: RazorpayOrder }` |
| 15 | POST | `/api/payment/verify` | public | `{ razorpay_order_id, razorpay_payment_id, razorpay_signature }` | `200 { message }`, `400` |

### Analytics - `backend/routes/analyticsRoutes.js` (mounted)

| # | Method | Path | Auth | Response |
| --- | --- | --- | --- | --- |
| 16 | GET | `/api/analytics` | Bearer + admin | `200 { totalOrders, totalProducts, totalUsers, totalRevenue }` |

### Checkout sequence

1. Re-fetch `GET /api/products` and validate stock/prices (totals recomputed from backend data).
2. `POST /api/payment/order` with the rupee total.
3. Open the Razorpay widget (`checkout.razorpay.com`).
4. `POST /api/payment/verify` with the returned identifiers + signature.
5. `POST /api/orders` with the verified `paymentId` - success is only claimed after `201`.

---

## 4. API URL labels

`<ApiEndpointLabel />` renders the real request above every backend-triggering control:

- `<ApiEndpointLabel endpoint={ENDPOINTS.login} />` → `POST http://localhost:3000/api/auth/login`
- `<ApiEndpointLabel endpoint={ENDPOINTS.updateOrderStatus} pathParams={{ id }} />` → resolved id in the URL
- Query parameters are included when the request uses them; method badges are colour-coded
  (GET green, POST blue, PUT amber, DELETE red) with a copy-to-clipboard button.
- **Never** contains JWTs, passwords, OTPs or payment secrets. `buildEndpointUrl()` also
  redacts sensitive query keys as defence-in-depth.
- Because the label and the Axios call read from the same descriptor in
  `src/utils/endpoints.js`, a displayed URL cannot disagree with the request actually sent.

---

## 5. Design system

`src/index.css` defines the whole system on Tailwind v4's `@theme`:

- **Surfaces** — `.glass`, `.glass-strong`, `.glass-subtle` (translucent fills, 1px
  white/12 borders, `backdrop-filter: blur()` + saturate, layered shadows, inset highlight).
- **Depth** — decorative blurred blobs and multi-stop radial gradients on a midnight base.
- **Buttons** — `.btn-primary` (indigo→violet), `.btn-accent` (cyan→indigo), `.btn-outline`,
  `.btn-ghost`, `.btn-danger`; hover lift + glow.
- **Forms** — `.input-glass` with focus ring, invalid state.
- **Fallbacks** — `@supports not (backdrop-filter)` swaps in a near-opaque surface so content
  stays readable where blur is unsupported.
- **Accessibility** — global `:focus-visible` ring, skip-to-content link, and a
  `prefers-reduced-motion` block that disables animations/transitions.

---

## 6. Known backend issues (frontend does NOT hide these)

These were verified by reading the backend source. The frontend sends the correct requests
and surfaces the server's response; it never fakes a success.

| # | Endpoint | Issue | Impact in UI |
| --- | --- | --- | --- |
| 1 | `POST /api/products` | `createProduct` destructures `catagory` but passes undefined `category` → always `500` | Admin "Create product" shows the server error; a `BackendNote` banner explains it. |
| 2 | `DELETE /api/products/:id` | Calls `product.remove()`, removed in mongoose 9 → always `500` | Delete confirm modal surfaces the error. |
| 3 | `POST /api/orders` | `addOrderItems` passes undefined `items` to `new Order()` → always `500` | Checkout surfaces the error; no success page is shown. |
| 4 | Order schema | `products` is a single embedded doc, not an array | Multi-item carts send one `POST /api/orders` per line, sharing one `paymentId`. |
| 5 | OTP resend | No resend route exists; re-registering returns "User already exists" | VerifyEmail page states the limitation. |
| 6 | Profile / role | No `/api/auth/me`; login returns no `role` | Role is resolved by calling the admin-only `GET /api/analytics` (200 = admin, 403 = user) and cached locally. |
| 7 | Product search | `getProducts` ignores query params | Search / category / sort run client-side over the full list. |
| 8 | `GET /api/orders/:id` | Controller exported but never mounted | No order-detail route is offered. |

See `../INTEGRATION_REPORT.md` for the full report, including the missing env vars and
the float-precision caveat on `/api/payment/order`.

---

## 7. Security notes

- JWT is stored in `localStorage` because the backend issues a stateless 30-day token with
  no refresh/cookie flow. This is a documented trade-off (XSS on this origin could read it);
  the app never renders untrusted HTML and never places tokens in URLs, labels or logs.
- The token is attached **only** to endpoints whose descriptor sets `requiresAuth: true`.
- An expired/invalid token (401) clears the session exactly once via a shared interceptor.
- Client-side route guards (`ProtectedRoute`, `AdminRoute`) are UX only - the backend's
  `protect` + `admin` middleware is the authority, and every admin call is re-checked there.
- Prices, stock, totals and roles are re-validated against the backend; the client never
  trusts its own numbers as authoritative.
- Razorpay's **secret** and the Cloudinary credentials stay server-side. Images are uploaded
  through the API (Multer → Cloudinary), never directly from the browser.
