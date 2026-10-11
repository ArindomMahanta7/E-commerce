/**
 * Typed wrappers around browser storage.
 *
 * SECURITY NOTE (documented trade-off):
 * The backend issues a stateless JWT (30-day expiry) and exposes no
 * refresh-token or httpOnly-cookie flow, so the token has to survive a page
 * reload somewhere on the client. localStorage was chosen because it is the
 * only option that keeps the user signed in across reloads with this backend.
 *
 * Trade-off: any XSS running on this origin could read the token. Mitigations
 * applied here:
 *   - no user-generated HTML is rendered (React text nodes only),
 *   - no secrets/tokens are ever placed in URLs, labels or logs,
 *   - the token is only attached to requests to the configured backend origin.
 */

const KEYS = {
  token: "shopnest_token",
  user: "shopnest_user",
  role: "shopnest_role",
  cart: "shopnest_cart",
};

const safeParse = (raw) => {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

/* ------------------------------- token ------------------------------- */
export const getStoredToken = () => localStorage.getItem(KEYS.token);
export const setStoredToken = (token) =>
  localStorage.setItem(KEYS.token, token);

/* -------------------------------- user ------------------------------- */
export const getStoredUser = () => safeParse(localStorage.getItem(KEYS.user));
export const setStoredUser = (user) =>
  localStorage.setItem(KEYS.user, JSON.stringify(user));
export const clearStoredUser = () => localStorage.removeItem(KEYS.user);

/* -------------------------------- role ------------------------------- */
/** @returns {"user"|"admin"|null} */
export const getStoredRole = () => {
  const role = localStorage.getItem(KEYS.role);
  return role === "admin" || role === "user" ? role : null;
};
export const setStoredRole = (role) => localStorage.setItem(KEYS.role, role);

/* -------------------------------- cart ------------------------------- */
export const getStoredCart = () => {
  const cart = safeParse(localStorage.getItem(KEYS.cart));
  return Array.isArray(cart) ? cart : [];
};
export const setStoredCart = (items) =>
  localStorage.setItem(KEYS.cart, JSON.stringify(items));

/* ------------------------------ teardown ----------------------------- */
export const clearAuthStorage = () => {
  localStorage.removeItem(KEYS.token);
  localStorage.removeItem(KEYS.user);
  localStorage.removeItem(KEYS.role);
};

export const STORAGE_KEYS = KEYS;
