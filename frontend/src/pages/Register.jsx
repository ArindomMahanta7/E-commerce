import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { UserPlus } from "lucide-react";
import toast from "react-hot-toast";

import * as authService from "../services/authService";
import { ENDPOINTS } from "../utils/endpoints";
import {
  MIN_PASSWORD_LENGTH,
  normalizeEmail,
  validateEmail,
  validatePassword,
} from "../utils/validators";
import useDocumentTitle from "../hooks/useDocumentTitle";
import ApiEndpointLabel from "../components/common/ApiEndpointLabel";
import BackendNote from "../components/common/BackendNote";
import Button from "../components/common/Button";

const EMPTY_FORM = { name: "", email: "", password: "", confirmPassword: "" };

export default function Register() {
  useDocumentTitle("Create account");

  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = "Name is required.";
    if (!validateEmail(form.email)) nextErrors.email = "Enter a valid email address.";
    if (!validatePassword(form.password)) {
      nextErrors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
    }
    if (form.confirmPassword !== form.password) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }
    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;

    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const response = await authService.register({
        name: form.name.trim(),
        email: normalizeEmail(form.email),
        password: form.password,
      });

      toast.success(response?.message || "Account created.");

      // Registration does NOT log the user in - the backend requires the OTP
      // first, so we hand the email over to the verification page.
      navigate("/verify-email", {
        state: { email: normalizeEmail(form.email) },
        replace: true,
      });
    } catch (error) {
      if (error.status === 400 || error.status === 409) {
        setErrors({ email: "An account with this email already exists." });
        toast.error("An account with this email already exists.");
      } else if (error.status === 201) {
        toast.success("Account created.");
      } else {
        toast.error(error.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="glass-strong rounded-3xl p-6 sm:p-8"
      >
        <h1 className="text-2xl font-bold text-white">Create your account</h1>
        <p className="mt-1.5 text-sm text-slate-400">
          We will email you a 6-digit OTP to verify your address.
        </p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4" noValidate>
          <div>
            <label htmlFor="register-name" className="label-glass">
              Full name
            </label>
            <input
              id="register-name"
              type="text"
              autoComplete="name"
              value={form.name}
              onChange={handleChange("name")}
              className="input-glass"
              placeholder="Your name"
              aria-invalid={Boolean(errors.name)}
              required
            />
            {errors.name && (
              <p className="mt-1 text-xs text-rose-300">{errors.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="register-email" className="label-glass">
              Email address
            </label>
            <input
              id="register-email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={handleChange("email")}
              className="input-glass"
              placeholder="you@example.com"
              aria-invalid={Boolean(errors.email)}
              required
            />
            {errors.email && (
              <p className="mt-1 text-xs text-rose-300">{errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="register-password" className="label-glass">
              Password
            </label>
            <input
              id="register-password"
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange("password")}
              className="input-glass"
              placeholder="At least 6 characters"
              aria-invalid={Boolean(errors.password)}
              required
            />
            {errors.password && (
              <p className="mt-1 text-xs text-rose-300">{errors.password}</p>
            )}
          </div>

          <div>
            <label htmlFor="register-confirm" className="label-glass">
              Confirm password
            </label>
            <input
              id="register-confirm"
              type="password"
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={handleChange("confirmPassword")}
              className="input-glass"
              placeholder="Repeat your password"
              aria-invalid={Boolean(errors.confirmPassword)}
              required
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-rose-300">{errors.confirmPassword}</p>
            )}
          </div>

          <ApiEndpointLabel
            endpoint={ENDPOINTS.register}
            description={ENDPOINTS.register.description}
          />

          <Button type="submit" fullWidth loading={submitting} className="py-3">
            <UserPlus className="h-4 w-4" aria-hidden="true" />
            Create account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-iris-300 transition-colors hover:text-iris-200"
          >
            Sign in
          </Link>
        </p>

        <div className="mt-6">
          <BackendNote title="OTP delivery depends on backend email settings">
            <p>
              The OTP is generated and emailed by the server. The backend{" "}
              <code className="font-mono text-[11px]">.env</code> currently only
              contains <code className="font-mono text-[11px]">OTP_SECRET</code> -
              without Gmail credentials the account is created but no OTP email is
              sent.
            </p>
          </BackendNote>
        </div>
      </motion.div>
    </div>
  );
}
