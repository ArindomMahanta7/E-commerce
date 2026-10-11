/**
 * Order-shape helpers.
 *
 * model/orders.js stores `products` as ONE embedded document:
 *   { product: ObjectId(ref product), quantity: Number, price: Number }
 * but defensively handles an array too, in case data was written in another
 * shape, so the UI never crashes on unexpected data.
 */

/** Normalises an order into a flat list of displayable line items. */
export const getOrderItems = (order) => {
  const products = order?.products;
  if (!products) return [];

  const lines = Array.isArray(products) ? products : [products];

  return lines
    .filter((line) => line && (line.product || line.quantity))
    .map((line) => {
      const populated =
        line.product && typeof line.product === "object" ? line.product : null;
      return {
        productId: populated?._id ?? (typeof line.product === "string" ? line.product : null),
        name: populated?.name ?? "Product",
        price: line.price ?? populated?.price ?? 0,
        quantity: line.quantity ?? 1,
      };
    });
};

/** Order statuses actually supported by the backend enum. */
export const ORDER_STATUSES = ["pending", "shipped", "delivered"];

/** The documented admin workflow: pending -> shipped -> delivered */
export const NEXT_STATUS = {
  pending: "shipped",
  shipped: "delivered",
  delivered: null,
};

export const STATUS_STYLES = {
  pending: "border-amber-400/40 bg-amber-400/10 text-amber-300",
  shipped: "border-sky-400/40 bg-sky-400/10 text-sky-300",
  delivered: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
};

export const formatDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

/** Short, readable order reference for the UI. */
export const shortId = (value, length = 8) => {
  const id = String(value ?? "");
  return id.length > length ? `${id.slice(0, length)}…` : id;
};
