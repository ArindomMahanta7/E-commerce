import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { RefreshCw, ShieldCheck, Users as UsersIcon } from "lucide-react";

import * as authService from "../../services/authService";
import { ENDPOINTS } from "../../utils/endpoints";
import { formatDate } from "../../utils/orderShape";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import ApiEndpointLabel from "../../components/common/ApiEndpointLabel";
import BackendNote from "../../components/common/BackendNote";
import EmptyState from "../../components/common/EmptyState";
import ErrorState from "../../components/common/ErrorState";
import { SkeletonRow } from "../../components/common/Skeleton";

export default function AdminUsers() {
  useDocumentTitle("Manage users");

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* GET /api/auth/users -> User[] with `-password -otp` already stripped */
  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.listUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Users</h1>
          <p className="mt-1 text-sm text-slate-400">
            {loading
              ? "Loading…"
              : `${users.length} registered user${users.length === 1 ? "" : "s"}`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <ApiEndpointLabel
            endpoint={ENDPOINTS.listUsers}
            description={ENDPOINTS.listUsers.description}
          />
          <button
            type="button"
            onClick={loadUsers}
            className="btn btn-ghost text-xs"
            aria-label="Refresh users"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            Refresh
          </button>
        </div>
      </header>

      <BackendNote title="Read-only user management">
        <p>
          The backend only exposes a read-only user list - there are no
          user-update or user-delete endpoints, so no editing actions are offered
          here. Password hashes and OTP fields are stripped by the server before
          the response is sent.
        </p>
      </BackendNote>

      <div className="mt-6">
        {loading && <SkeletonRow count={5} />}

        {!loading && error && <ErrorState message={error} onRetry={loadUsers} />}

        {!loading && !error && users.length === 0 && (
          <EmptyState
            icon={UsersIcon}
            title="No users found"
            message="Registered customers will appear here."
            action={
              <Link to="/admin" className="btn btn-outline">
                Back to overview
              </Link>
            }
          />
        )}

        {!loading && !error && users.length > 0 && (
          <div className="glass overflow-hidden rounded-2xl">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[40rem] text-left text-sm">
                <thead className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wider text-slate-400">
                  <tr>
                    <th scope="col" className="px-4 py-3">Name</th>
                    <th scope="col" className="px-4 py-3">Email</th>
                    <th scope="col" className="px-4 py-3">Role</th>
                    <th scope="col" className="px-4 py-3">Verified</th>
                    <th scope="col" className="px-4 py-3">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map((user) => (
                    <tr
                      key={user._id}
                      className="transition-colors hover:bg-white/[0.03]"
                    >
                      <td className="px-4 py-3 font-medium text-white">
                        {user.name}
                      </td>
                      <td className="px-4 py-3 break-all text-slate-300">
                        {user.email}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${
                            user.role === "admin"
                              ? "border-iris-400/40 bg-iris-500/10 text-iris-300"
                              : "border-emerald-400/40 bg-emerald-500/10 text-emerald-300"
                          }`}
                        >
                          {user.role === "admin" && (
                            <ShieldCheck className="h-3 w-3" aria-hidden="true" />
                          )}
                          {user.role ?? "user"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                            user.verified
                              ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-300"
                              : "border-amber-400/30 bg-amber-500/10 text-amber-300"
                          }`}
                        >
                          {user.verified ? "Verified" : "Pending"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400">
                        {formatDate(user.createdAt) ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
