import { useEffect, useState } from "react";
import { Check, Copy, Terminal } from "lucide-react";

import { describeEndpoint } from "../../utils/endpoints";

const METHOD_STYLES = {
  GET: "bg-emerald-400/15 text-emerald-300 border-emerald-400/30",
  POST: "bg-sky-400/15 text-sky-300 border-sky-400/30",
  PUT: "bg-amber-400/15 text-amber-300 border-amber-400/30",
  PATCH: "bg-violet-400/15 text-violet-300 border-violet-400/30",
  DELETE: "bg-rose-400/15 text-rose-300 border-rose-400/30",
};

const FALLBACK_METHOD_STYLE = "bg-slate-400/15 text-slate-300 border-slate-400/30";

const copyText = async (text) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  // Fallback for older browsers / insecure contexts
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
};

/**
 * Displays the exact HTTP method + resolved URL of a backend request.
 *
 * Pass either:
 *   - an `endpoint` descriptor from ENDPOINTS (+ optional `pathParams`/`params`),
 *     which is the same descriptor the service layer uses to send the request,
 *   - or an explicit `method` + `url`.
 *
 * SECURITY: the label is rendered from the endpoint descriptor only, so JWTs,
 * passwords, OTPs and payment secrets can never appear in it. Query values for
 * sensitive keys are redacted by `buildEndpointUrl` as defence-in-depth.
 *
 * @param {{
 *   endpoint?: object,
 *   pathParams?: Record<string, string|number>,
 *   params?: Record<string, any>,
 *   method?: string,
 *   url?: string,
 *   description?: string,
 *   className?: string,
 * }} props
 */
export default function ApiEndpointLabel({
  endpoint,
  pathParams,
  params,
  method,
  url,
  description,
  className = "",
}) {
  const [copied, setCopied] = useState(false);

  let resolved = { method, url };
  if (endpoint) {
    try {
      resolved = describeEndpoint(endpoint, { pathParams, params });
    } catch {
      // A dynamic path parameter is not available yet - render nothing
      // rather than crashing the surrounding page.
      return null;
    }
  }

  const requestMethod = String(resolved?.method ?? "GET").toUpperCase();
  const requestUrl = String(resolved?.url ?? "");

  useEffect(() => {
    if (!copied) return undefined;
    const timeout = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(timeout);
  }, [copied]);

  const handleCopy = async () => {
    try {
      await copyText(`${requestMethod} ${requestUrl}`);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  if (!requestUrl) return null;

  return (
    <div
      className={`flex flex-wrap items-center gap-2 ${className}`}
      title={description || `${requestMethod} ${requestUrl}`}
    >
      <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        <Terminal className="h-3 w-3" aria-hidden="true" />
        API
      </span>

      <div className="flex min-w-0 max-w-full items-center gap-2 rounded-lg border border-white/10 bg-slate-950/50 px-2.5 py-1.5 backdrop-blur-md">
        <span
          className={`shrink-0 rounded border px-1.5 py-0.5 font-mono text-[10px] font-bold leading-none ${
            METHOD_STYLES[requestMethod] ?? FALLBACK_METHOD_STYLE
          }`}
        >
          {requestMethod}
        </span>

        <code className="min-w-0 break-all font-mono text-[11px] leading-relaxed text-slate-300">
          {requestUrl}
        </code>

        <button
          type="button"
          onClick={handleCopy}
          className="shrink-0 rounded p-1 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
          aria-label={
            copied
              ? "Request URL copied to clipboard"
              : `Copy request ${requestMethod} ${requestUrl}`
          }
        >
          {copied ? (
            <Check className="h-3 w-3 text-emerald-400" aria-hidden="true" />
          ) : (
            <Copy className="h-3 w-3" aria-hidden="true" />
          )}
        </button>
      </div>
    </div>
  );
}
