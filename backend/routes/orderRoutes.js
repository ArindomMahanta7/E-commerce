import express from "express";
import { addOrderItems, getMyOrders, getOrders, updateOrderStatus } from "../controllers/orderController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { admin } from "../middlewares/adminMiddleware.js";

const orderRoutes = express.Router();

orderRoutes.route('/').post(protect, addOrderItems).get(protect, admin, getOrders);
orderRoutes.route('/myorders').get(protect, getMyOrders);
orderRoutes.route('/:id/status').put(protect, admin, updateOrderStatus);

export default orderRoutes;