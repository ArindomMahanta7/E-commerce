import { STATUS_STYLES } from "../../utils/orderShape";

/** Coloured pill for the order statuses the backend supports. */
export default function StatusBadge({ status }) {
  const normalized = String(status ?? "pending").toLowerCase();
  const style = STATUS_STYLES[normalized] ?? STATUS_STYLES.pending;

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${style}`}
    >
      {normalized}
    </span>
  );
}
