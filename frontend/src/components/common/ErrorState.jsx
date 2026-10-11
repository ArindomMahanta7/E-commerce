import { RefreshCw, TriangleAlert } from "lucide-react";

import Button from "./Button";

/**
 * Error panel with an optional retry action.
 * Only safe, user-facing messages are rendered (never stack traces).
 */
export default function ErrorState({
  message = "Something went wrong while loading this content.",
  onRetry,
  retryLabel = "Try again",
}) {
  return (
    <div className="glass flex flex-col items-center justify-center gap-3 rounded-2xl border-rose-400/20 px-6 py-12 text-center">
      <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-4">
        <TriangleAlert className="h-8 w-8 text-rose-300" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold text-white">Something went wrong</h3>
      <p className="max-w-md text-sm text-slate-400">{message}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry} className="mt-2">
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
