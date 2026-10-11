import axios from "axios";

import { API_BASE_URL, buildEndpointUrl, ENDPOINTS } from "../utils/endpoints";
import { normalizeApiError } from "../utils/apiError";
import { getStoredToken } from "../utils/storage";

/**
 * Central Axios configuration.
 *
 * - `baseURL` comes from VITE_API_BASE_URL (see .env.example).
 * - The `Authorization: Bearer <JWT>` header is attached ONLY for endpoints
 *   whose descriptor sets `requiresAuth: true`, matching the backend's
 *   `protect` middleware wiring. Public endpoints are left untouched.
 * - Every failure is normalised into `ApiError` so pages can branch on a
 *   safe `status` without ever rendering raw server internals.
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 45000, // product image uploads go through Cloudinary server-side
});

let onUnauthorized = null;

/**
 * Registered by <AuthProvider> so an expired/invalid JWT clears the session
 * exactly once, no matter which request discovered it first.
 */
export const setUnauthorizedHandler = (handler) => {
  onUnauthorized = handler;
};

api.interceptors.request.use((config) => {
  if (config.requiresAuth) {
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  // Let the browser set the multipart boundary for image uploads.
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    // Expired / tampered / malformed token: drop the local session once.
    if (
      status === 401 &&
      getStoredToken() &&
      !error?.config?.url?.includes("/api/auth/login")
    ) {
      onUnauthorized?.();
    }

    return Promise.reject(error);
  }
);

/**
 * The only way pages/services issue requests.
 *
 * @param {object} endpoint descriptor from ENDPOINTS
 * @param {{
 *   data?: any,
 *   pathParams?: Record<string, string|number>,
 *   params?: Record<string, any>,
 *   signal?: AbortSignal,
 * }} [options]
 * @returns {Promise<any>} response body
 * @throws {import("../utils/apiError").ApiError}
 */
export const call = async (endpoint, options = {}) => {
  const { data, pathParams, params, signal } = options;

  const url = buildEndpointUrl(endpoint, { pathParams, params });

  try {
    const response = await api.request({
      method: endpoint.method,
      url,
      data,
      requiresAuth: Boolean(endpoint.requiresAuth),
      signal,
    });
    return response.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
};

export { ENDPOINTS, API_BASE_URL };
