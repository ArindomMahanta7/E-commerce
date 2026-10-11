import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import toast from "react-hot-toast";

import * as authService from "../services/authService";
import { setUnauthorizedHandler } from "../services/api";
import {
  clearAuthStorage,
  getStoredRole,
  getStoredToken,
  getStoredUser,
  setStoredRole,
  setStoredToken,
  setStoredUser,
} from "../utils/storage";

const AuthContext = createContext(null);

/**
 * Central authentication state.
 *
 * Backend contract (authController.js):
 *  - login returns { id, name, email, token } - NO role and NO `verified` flag
 *  - JWT expires in 30 days and unverified accounts are rejected with 403
 *  - there is no /me profile endpoint and no server-side logout endpoint
 *
 * Because `role` is never returned, it is resolved through an admin-endpoint
 * probe (see authService.detectRole) and cached locally so the UI can decide
 * whether to show admin navigation. This is a UX affordance only - every
 * admin API call is still authorized by the backend's `protect` + `admin`
 * middleware.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [token, setToken] = useState(() => getStoredToken());
  const [role, setRole] = useState(() => getStoredRole());
  const [isInitializing, setIsInitializing] = useState(true);

  /* Expired/invalid token discovered by any request -> clean up once. */
  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearAuthStorage();
      setUser(null);
      setToken(null);
      setRole(null);
      toast.error("Your session expired. Please sign in again.");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.assign("/login");
      }
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  /* On a fresh page load, resolve the role once so nav can render correctly. */
  useEffect(() => {
    let cancelled = false;

    const restore = async () => {
      if (token && !role) {
        try {
          const detected = await authService.detectRole();
          if (!cancelled) setRole(detected);
        } catch {
          /* network failure: keep the previous (null) role - treated as "user" */
        }
      }
      if (!cancelled) setIsInitializing(false);
    };

    restore();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshRole = useCallback(async () => {
    try {
      const detected = await authService.detectRole();
      setRole(detected);
      setStoredRole(detected);
      return detected;
    } catch {
      return getStoredRole();
    }
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const data = await authService.login({ email, password });

    const nextUser = {
      id: data.id,
      name: data.name,
      email: data.email,
    };

    setStoredToken(data.token);
    setStoredUser(nextUser);
    setToken(data.token);
    setUser(nextUser);

    // Resolve the role before returning so redirect decisions are accurate.
    let detectedRole = "user";
    try {
      detectedRole = await authService.detectRole();
    } catch {
      detectedRole = "user";
    }
    setRole(detectedRole);
    setStoredRole(detectedRole);

    return { user: nextUser, role: detectedRole };
  }, []);

  const logout = useCallback(() => {
    // The backend exposes no logout endpoint: JWTs are stateless, so logout is
    // a client-side action that destroys the local session only.
    clearAuthStorage();
    setUser(null);
    setToken(null);
    setRole(null);
    toast.success("Signed out");
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      role,
      isAuthenticated: Boolean(token),
      isAdmin: role === "admin",
      isInitializing,
      login,
      logout,
      refreshRole,
    }),
    [user, token, role, isInitializing, login, logout, refreshRole]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within <AuthProvider>");
  return context;
}
