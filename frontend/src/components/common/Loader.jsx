import { Loader2 } from "lucide-react";

/** Full-area loading spinner with an accessible label. */
export default function Loader({ label = "Loading", className = "" }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 py-14 text-slate-400 ${className}`}
      role="status"
      aria-live="polite"
    >
      <Loader2 className="h-8 w-8 animate-spin text-iris-400" aria-hidden="true" />
      <span className="text-sm">{label}…</span>
    </div>
  );
}
