import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { MailCheck, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

import * as authService from "../services/authService";
import { ENDPOINTS } from "../utils/endpoints";
import {
  OTP_LENGTH,
  isValidOtp,
  normalizeEmail,
  validateEmail,
} from "../utils/validators";
import useDocumentTitle from "../hooks/useDocumentTitle";
import ApiEndpointLabel from "../components/common/ApiEndpointLabel";
import BackendNote from "../components/common/BackendNote";
import Button from "../components/common/Button";

export default function VerifyEmail() {
  useDocumentTitle("Verify your email");

  const location = useLocation();
  const inputRef = useRef(null);

  const [email, setEmail] = useState(location.state?.email ?? "");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (verifying) return;

    const normalizedEmail = normalizeEmail(email);
    if (!validateEmail(normalizedEmail)) {
      setError("Enter a valid email address.");
      return;
    }
    if (!isValidOtp(otp)) {
      setError(`The OTP must be exactly ${OTP_LENGTH} digits.`);
      return;
    }

    setError(null);
    setVerifying(true);
    try {
      // The server generates, hashes, stores and validates the OTP - the
      // frontend never generates or checks it locally, and never stores it.
      await authService.verifyEmail({ email: normalizedEmail, otp });
      setVerified(true);
      toast.success("Email verified! You can now sign in.");
    } catch (err) {
      if (err.status === 404) {
        setError("No account was found for this email address.");
      } else if (err.status === 400) {
        // expired / invalid / already verified - server message is precise
        setError(err.message);
      } else {
        setError(err.message);
      }
    } finally {
      setVerifying(false);
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
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-iris-400/30 bg-iris-500/10">
          <MailCheck className="h-6 w-6 text-iris-300" aria-hidden="true" />
        </div>

        <h1 className="mt-5 text-2xl font-bold text-white">Verify your email</h1>
        <p className="mt-1.5 text-sm text-slate-400">
          Enter the {OTP_LENGTH}-digit code we emailed you. It expires 5 minutes
          after it was sent.
        </p>

        {verified ? (
          <div className="mt-7 rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
            <p className="flex items-center gap-2 font-semibold text-emerald-300">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              Email verified successfully.
            </p>
            <Link to="/login" className="btn btn-primary mt-4 w-full">
              Continue to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-7 space-y-4" noValidate>
            <div>
              <label htmlFor="verify-email" className="label-glass">
                Email address
              </label>
              <input
                id="verify-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="input-glass"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label htmlFor="verify-otp" className="label-glass">
                One-time password
              </label>
              <input
                ref={inputRef}
                id="verify-otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={OTP_LENGTH}
                value={otp}
                onChange={(event) =>
                  setOtp(event.target.value.replace(/\D/g, "").slice(0, OTP_LENGTH))
                }
                className="input-glass text-center font-mono text-xl tracking-[0.5em]"
                placeholder="000000"
                aria-invalid={Boolean(error)}
                required
              />
              {error && <p className="mt-1 text-xs text-rose-300">{error}</p>}
            </div>

            <ApiEndpointLabel
              endpoint={ENDPOINTS.verifyEmail}
              description={ENDPOINTS.verifyEmail.description}
            />

            <Button
              type="submit"
              fullWidth
              loading={verifying}
              disabled={otp.length !== OTP_LENGTH}
              className="py-3"
            >
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              Verify email
            </Button>
          </form>
        )}

        <div className="mt-6 space-y-4">
          <BackendNote title="No OTP resend endpoint exists">
            <p>
              The backend only implements{" "}
              <code className="font-mono text-[11px]">POST /api/auth/register</code>,{" "}
              <code className="font-mono text-[11px]">POST /api/auth/login</code> and{" "}
              <code className="font-mono text-[11px]">POST /api/auth/verify_email</code>{" "}
              - there is no resend route, so this page cannot request a new code.
            </p>
            <p>
              Registering again with the same email returns{" "}
              <em>User already exists</em>, which means a lost OTP currently
              requires a backend change to recover. This is a backend limitation,
              not something the frontend can work around.
            </p>
          </BackendNote>

          <p className="text-center text-sm text-slate-400">
            <Link
              to="/login"
              className="font-semibold text-iris-300 transition-colors hover:text-iris-200"
            >
              Back to sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
