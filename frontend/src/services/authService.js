import { call, ENDPOINTS } from "./api";

/**
 * /api/auth service.
 * Verified against backend/routes/authRoutes.js and controllers/authController.js.
 */

/** POST /api/auth/register -> 201 { id, name, email, message } */
export const register = ({ name, email, password }) =>
  call(ENDPOINTS.register, { data: { name, email, password } });

/** POST /api/auth/login -> 200 { id, name, email, token, message } */
export const login = ({ email, password }) =>
  call(ENDPOINTS.login, { data: { email, password } });

/** POST /api/auth/verify_email -> 200 { message } */
export const verifyEmail = ({ email, otp }) =>
  call(ENDPOINTS.verifyEmail, { data: { email, otp } });

/** GET /api/auth/users -> 200 User[] (admin only, password/otp stripped) */
export const listUsers = () => call(ENDPOINTS.listUsers);

/**
 * Determines the signed-in user's role.
 *
 * IMPORTANT, documented workaround:
 * The backend has NO profile endpoint and the login response does not include
 * `role` (see authController.loginUser). The JWT payload only contains `{ id }`.
 * The only way the client can learn the role is to call an admin-protected
 * endpoint and observe the result:
 *   - 200 -> the token belongs to an admin
 *   - 403 -> the token belongs to a regular user
 * GET /api/analytics is used because it is admin-only, mounted, and returns a
 * tiny payload (no customer PII).
 */
export const detectRole = async () => {
  try {
    await call(ENDPOINTS.analytics);
    return "admin";
  } catch (error) {
    if (error?.status === 403) return "user";
    throw error; // network failure / 500 -> caller keeps the cached role
  }
};
