import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import Loader from "../components/common/Loader";

/**
 * Client-side guard for authenticated-only pages.
 * This is a UX affordance only - the backend's `protect` middleware remains
 * the authoritative check for every protected API call.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isInitializing } = useAuth();
  const location = useLocation();

  if (isInitializing) return <Loader label="Restoring your session" />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
