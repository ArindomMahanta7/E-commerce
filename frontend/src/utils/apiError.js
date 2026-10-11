/**
 * Normalised API error.
 *
 * Axios errors are wrapped so UI code can branch on `status` without ever
 * leaking stack traces or raw server internals to the user.
 */

export class ApiError extends Error {
  /**
   * @param {string} message user-facing message
   * @param {number|null} status HTTP status code (null for network failures)
   * @param {{isNetworkError?: boolean, cause?: unknown}} meta
   */
  constructor(message, status = null, meta = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.isNetworkError = Boolean(meta.isNetworkError);
    if (meta.cause) this.cause = meta.cause;
  }
}

const FALLBACK_MESSAGES = {
  network: "Unable to reach the server. Check that the backend is running.",
  400: "The request was invalid. Please check the form and try again.",
  401: "You are not authorized. Please sign in again.",
  403: "You do not have permission to perform this action.",
  404: "The requested resource was not found.",
  409: "This conflicts with existing data.",
  413: "The uploaded file is too large.",
  500: "The server encountered an error. Please try again.",
  502: "The server is unavailable right now. Please try again.",
  503: "The server is unavailable right now. Please try again.",
};

/** Extracts a safe, user-facing message from a thrown Axios error. */
export const extractErrorMessage = (error) => {
  if (error instanceof ApiError) return error.message;

  // Non-Axios errors (programming errors) are not shown verbatim.
  if (!error?.response) {
    return FALLBACK_MESSAGES.network;
  }

  const data = error.response.data;
  const serverMessage =
    (typeof data === "string" ? data : data?.message) ||
    data?.error ||
    (Array.isArray(data?.errors) ? data.errors.join(", ") : null);

  if (serverMessage && serverMessage.length < 300) return serverMessage;

  return (
    FALLBACK_MESSAGES[error.response.status] ??
    "Something went wrong. Please try again."
  );
};

/** Converts any Axios error into a safe ApiError instance. */
export const normalizeApiError = (error) => {
  if (error instanceof ApiError) return error;

  if (error?.response) {
    const { status } = error.response;
    return new ApiError(extractErrorMessage(error), status, { cause: error });
  }

  if (error?.code === "ERR_CANCELED") {
    return new ApiError("Request was cancelled.", null, { cause: error });
  }

  return new ApiError(FALLBACK_MESSAGES.network, null, {
    isNetworkError: true,
    cause: error,
  });
};
