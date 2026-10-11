import express from "express";
import {createOrder, verifyPayment} from "../controllers/paymentController.js";

const paymentRoutes = express.Router();

paymentRoutes.post('/order', createOrder);
paymentRoutes.post('/verify', verifyPayment);

export default paymentRoutes;