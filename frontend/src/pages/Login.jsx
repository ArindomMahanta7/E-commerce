import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, LogIn } from "lucide-react";
import toast from "react-hot-toast";

import useDocumentTitle from "../hooks/useDocumentTitle";
import { useAuth } from "../context/AuthContext";
import { normalizeEmail, validateEmail } from "../utils/validators";
import ApiEndpointLabel from "../components/common/ApiEndpointLabel";
import Button from "../components/common/Button";
import { ENDPOINTS } from "../utils/endpoints";

export default function Login() {
  useDocumentTitle("Sign in");

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const from = location.state?.from;

  const handleChange = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;

    const nextErrors = {};
    if (!validateEmail(form.email)) nextErrors.email = "Enter a valid email address.";
    if (!form.password) nextErrors.password = "Password is required.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const { role } = await login({
        email: normalizeEmail(form.email),
        password: form.password,
      });

      toast.success("Signed in successfully");

      // Admins land in the dashboard, everyone else returns to their target.
      if (role === "admin") navigate("/admin", { replace: true });
      else navigate(from || "/", { replace: true });
    } catch (error) {
      if (error.status === 403) {
        // authController rejects unverified accounts with 403
        toast.error(
          "Please verify your email with the OTP we sent before signing in."
        );
        navigate("/verify-email", {
          state: { email: normalizeEmail(form.email) },
        });
      } else if (error.status === 400) {
        setErrors({ password: "Invalid email or password." });
        toast.error("Invalid email or password.");
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
        <h1 className="text-2xl font-bold text-white">Welcome back</h1>
        <p className="mt-1.5 text-sm text-slate-400">
          Sign in to place orders and track deliveries.
        </p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4" noValidate>
          <div>
            <label htmlFor="login-email" className="label-glass">
              Email address
            </label>
            <input
              id="login-email"
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
            <label htmlFor="login-password" className="label-glass">
              Password
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={form.password}
                onChange={handleChange("password")}
                className="input-glass pr-11"
                placeholder="••••••••"
                aria-invalid={Boolean(errors.password)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-rose-300">{errors.password}</p>
            )}
          </div>

          {/* The exact request the button below sends */}
          <ApiEndpointLabel
            endpoint={ENDPOINTS.login}
            description={ENDPOINTS.login.description}
          />

          <Button type="submit" fullWidth loading={submitting} className="py-3">
            <LogIn className="h-4 w-4" aria-hidden="true" />
            Sign in
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          New here?{" "}
          <Link
            to="/register"
            className="font-semibold text-iris-300 transition-colors hover:text-iris-200"
          >
            Create an account
          </Link>
        </p>
        <p className="mt-2 text-center text-xs text-slate-500">
          Lost your OTP?{" "}
          <Link to="/verify-email" className="text-slate-400 hover:text-white">
            Enter it manually
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
