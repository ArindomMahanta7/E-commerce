import { PackageOpen } from "lucide-react";

/** Friendly empty-state panel with an optional action. */
export default function EmptyState({
  icon: Icon = PackageOpen,
  title = "Nothing here yet",
  message,
  action,
}) {
  return (
    <div className="glass flex flex-col items-center justify-center gap-3 rounded-2xl px-6 py-14 text-center">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <Icon className="h-8 w-8 text-iris-300" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      {message && <p className="max-w-md text-sm text-slate-400">{message}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
