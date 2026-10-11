import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogOut, RefreshCw, ShieldCheck, UserRound } from "lucide-react";

import useDocumentTitle from "../hooks/useDocumentTitle";
import { useAuth } from "../context/AuthContext";
import BackendNote from "../components/common/BackendNote";
import Button from "../components/common/Button";
import PageHeader from "../components/common/PageHeader";

export default function Profile() {
  useDocumentTitle("Profile");

  const navigate = useNavigate();
  const { user, role, isAdmin, logout, refreshRole } = useAuth();
  const [checkingRole, setCheckingRole] = useState(false);

  const handleRefreshRole = async () => {
    setCheckingRole(true);
    await refreshRole();
    setCheckingRole(false);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="Account"
        title="Your profile"
        subtitle="Details available from your signed-in session."
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="glass-strong rounded-3xl p-6 sm:p-8"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-iris-500 to-glow-500 shadow-lg shadow-iris-600/30">
            <UserRound className="h-8 w-8 text-white" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-xl font-bold text-white">
              {user?.name ?? "Unnamed user"}
            </h2>
            <p className="truncate text-sm text-slate-400">{user?.email}</p>
          </div>
        </div>

        <dl className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="glass-subtle rounded-xl p-4">
            <dt className="text-xs uppercase tracking-wider text-slate-400">Name</dt>
            <dd className="mt-1 text-sm font-semibold text-white">
              {user?.name ?? "—"}
            </dd>
          </div>
          <div className="glass-subtle rounded-xl p-4">
            <dt className="text-xs uppercase tracking-wider text-slate-400">Email</dt>
            <dd className="mt-1 break-all text-sm font-semibold text-white">
              {user?.email ?? "—"}
            </dd>
          </div>
          <div className="glass-subtle rounded-xl p-4">
            <dt className="text-xs uppercase tracking-wider text-slate-400">Role</dt>
            <dd className="mt-1 flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${
                  isAdmin
                    ? "border-iris-400/40 bg-iris-500/10 text-iris-300"
                    : "border-emerald-400/40 bg-emerald-500/10 text-emerald-300"
                }`}
              >
                {isAdmin && (
                  <ShieldCheck className="h-3 w-3" aria-hidden="true" />
                )}
                {role ?? "user"}
              </span>
            </dd>
          </div>
          <div className="glass-subtle rounded-xl p-4">
            <dt className="text-xs uppercase tracking-wider text-slate-400">
              Email verification
            </dt>
            <dd className="mt-1 text-sm text-slate-300">
              Verified - the backend only issues tokens to verified accounts.
            </dd>
          </div>
        </dl>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={handleRefreshRole}
            loading={checkingRole}
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Refresh role
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              logout();
              navigate("/");
            }}
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Logout
          </Button>
        </div>

        <div className="mt-6">
          <BackendNote title="Profile limitations of the current backend">
            <p>
              There is no <code className="font-mono text-[11px]">/api/auth/me</code>{" "}
              profile endpoint and no profile-update endpoint, so only the data
              returned at login can be shown. Name and email cannot be edited
              through this API.
            </p>
            <p>
              The login response contains no <code className="font-mono text-[11px]">role</code>{" "}
              field, so the role above is determined by calling the admin-only{" "}
              <code className="font-mono text-[11px]">GET /api/analytics</code> endpoint:
              a 200 response means admin, a 403 means regular user. Admin access is
              still enforced server-side on every admin request.
            </p>
            <p>
              Logout clears the local session only - the backend has no logout
              endpoint and JWTs remain valid until they expire.
            </p>
          </BackendNote>
        </div>
      </motion.div>
    </div>
  );
}
