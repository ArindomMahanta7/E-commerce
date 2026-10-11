import { Loader2 } from "lucide-react";

const VARIANT_CLASSES = {
  primary: "btn-primary",
  accent: "btn-accent",
  outline: "btn-outline",
  ghost: "btn-ghost",
  danger: "btn-danger",
};

/**
 * Reusable glass button with a built-in loading state.
 * @param {{variant?: "primary"|"accent"|"outline"|"ghost"|"danger", loading?: boolean, fullWidth?: boolean}} props
 */
export default function Button({
  variant = "primary",
  loading = false,
  fullWidth = false,
  className = "",
  children,
  disabled,
  ...rest
}) {
  return (
    <button
      className={`btn ${VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.primary} ${
        fullWidth ? "w-full" : ""
      } ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}
