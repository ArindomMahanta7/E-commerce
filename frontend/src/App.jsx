import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";
import AdminRoute from "./routes/AdminRoute";
import ProtectedRoute from "./routes/ProtectedRoute";
import Loader from "./components/common/Loader";

import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import MyOrders from "./pages/MyOrders";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import NotFound from "./pages/NotFound";

/* The admin section is code-split so shoppers never download it. */
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminProducts = lazy(() => import("./pages/admin/Products"));
const CreateProduct = lazy(() => import("./pages/admin/CreateProduct"));
const EditProduct = lazy(() => import("./pages/admin/EditProduct"));
const AdminOrders = lazy(() => import("./pages/admin/Orders"));
const AdminUsers = lazy(() => import("./pages/admin/Users"));

export default function App() {
  return (
    <Routes>
      {/* ---------------- Customer storefront ---------------- */}
      <Route element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <MyOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/order-success"
          element={
            <ProtectedRoute>
              <OrderSuccess />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Route>

      {/* ---------------- Admin dashboard ---------------- */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route
          index
          element={
            <Suspense fallback={<Loader label="Loading dashboard" />}>
              <AdminDashboard />
            </Suspense>
          }
        />
        <Route
          path="products"
          element={
            <Suspense fallback={<Loader label="Loading products" />}>
              <AdminProducts />
            </Suspense>
          }
        />
        <Route
          path="products/new"
          element={
            <Suspense fallback={<Loader label="Loading form" />}>
              <CreateProduct />
            </Suspense>
          }
        />
        <Route
          path="products/edit/:id"
          element={
            <Suspense fallback={<Loader label="Loading form" />}>
              <EditProduct />
            </Suspense>
          }
        />
        <Route
          path="orders"
          element={
            <Suspense fallback={<Loader label="Loading orders" />}>
              <AdminOrders />
            </Suspense>
          }
        />
        <Route
          path="users"
          element={
            <Suspense fallback={<Loader label="Loading users" />}>
              <AdminUsers />
            </Suspense>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
