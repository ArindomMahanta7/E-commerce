import { call, ENDPOINTS } from "./api";

/**
 * /api/orders service.
 * Verified against backend/routes/orderRoutes.js, controllers/orderController.js
 * and model/orders.js.
 */

/**
 * POST /api/orders (authenticated)
 *
 * Expected request body, exactly as validated in `addOrderItems`:
 *   {
 *     products:    { product: "<productId>", quantity: number, price: number },
 *     totalAmount: number,
 *     address:     { fullname, street, city, state },
 *     paymentId:   string   // Razorpay payment id, required by the controller
 *   }
 *
 * NOTE (backend limitation, documented in the README):
 * model/orders.js declares `products` as a SINGLE embedded document, not an
 * array, so one order row can only reference one product line. The frontend
 * therefore issues one POST per cart line (all sharing the same verified
 * paymentId) when the cart contains more than one product.
 *
 * @param {{products: object, totalAmount: number, address: object, paymentId: string}} payload
 */
export const createOrder = (payload) =>
  call(ENDPOINTS.createOrder, { data: payload });

/** GET /api/orders/myorders -> 200 { orders: Order[] } (populated products.product) */
export const getMyOrders = () => call(ENDPOINTS.myOrders);

/** GET /api/orders -> 200 Order[] (admin; populated user + products.product) */
export const getAllOrders = () => call(ENDPOINTS.listAllOrders);

/**
 * PUT /api/orders/:id/status (admin)
 * Status enum enforced by the model: "pending" | "shipped" | "delivered".
 */
export const updateOrderStatus = (id, status) =>
  call(ENDPOINTS.updateOrderStatus, { pathParams: { id }, data: { status } });
