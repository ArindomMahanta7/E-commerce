import { Info } from "lucide-react";

/**
 * Honest "known backend limitation" banner.
 *
 * Used wherever a backend endpoint is missing, unmounted, or currently
 * broken, so the UI never pretends an unsupported feature works.
 */
export default function BackendNote({ title = "Backend limitation", children }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-amber-400/25 bg-amber-400/10 px-4 py-3 text-sm text-amber-200/90 backdrop-blur-md">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" aria-hidden="true" />
      <div className="min-w-0">
        <p className="font-semibold text-amber-200">{title}</p>
        <div className="mt-1 space-y-1 text-amber-200/80">{children}</div>
      </div>
    </div>
  );
}
