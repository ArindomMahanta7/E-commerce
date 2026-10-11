import { Navigate } from "react-router-dom";
import { ShieldAlert } from "lucide-react";

import { useAuth } from "../context/AuthContext";
import Loader from "../components/common/Loader";
import EmptyState from "../components/common/EmptyState";
import Button from "../components/common/Button";

/**
 * Client-side guard for the admin area.
 *
 * The user's role comes from an admin-endpoint probe (authService.detectRole)
 * because the backend returns no role at login. This only hides admin UI from
 * regular users - every admin request is independently authorized server-side
 * by the `protect` + `admin` middleware, which returns 403 otherwise.
 */
export default function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, isInitializing } = useAuth();

  if (isInitializing) return <Loader label="Checking your access" />;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (!isAdmin) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="Admin access required"
        message="Your account does not have administrator privileges. The backend rejected this account for admin-only endpoints."
        action={
          <Button variant="outline" onClick={() => window.history.back()}>
            Go back
          </Button>
        }
      />
    );
  }

  return children;
}
