import { call, ENDPOINTS } from "./api";

/**
 * /api/analytics service.
 * Verified against backend/routes/analyticsRoutes.js and controllers/analyticsController.js.
 * Route IS mounted and protected by `protect` + `admin`.
 *
 * @returns {Promise<{totalOrders: number, totalProducts: number, totalUsers: number, totalRevenue: number}>}
 */
export const getStats = () => call(ENDPOINTS.analytics);
