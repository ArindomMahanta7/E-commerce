/** Lightweight client-side validation helpers. */

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Normalises an email the same way the backend does (trim + lowercase). */
export const normalizeEmail = (email) => String(email ?? "").trim().toLowerCase();

export const validateEmail = (email) => EMAIL_REGEX.test(normalizeEmail(email));

/** Minimum password length enforced in the UI (the backend itself sets no minimum). */
export const MIN_PASSWORD_LENGTH = 6;

export const validatePassword = (password) =>
  typeof password === "string" && password.length >= MIN_PASSWORD_LENGTH;

/** The OTP contract comes from backend/utils/otp.js + controllers/authController.js */
export const OTP_LENGTH = 6;
export const isValidOtp = (otp) => new RegExp(`^\\d{${OTP_LENGTH}}$`).test(String(otp ?? ""));

/** Address fields mirror model/orders.js (`address` sub-document, all required). */
export const EMPTY_ADDRESS = {
  fullname: "",
  street: "",
  city: "",
  state: "",
};

export const validateAddress = (address) => {
  const errors = {};
  Object.entries(EMPTY_ADDRESS).forEach(([field]) => {
    if (!String(address?.[field] ?? "").trim()) errors[field] = "Required";
  });
  return errors;
};

/** Returns the first invalid field name, or null when the form is valid. */
export const firstError = (errors) => {
  const key = Object.keys(errors)[0];
  return key ?? null;
};
