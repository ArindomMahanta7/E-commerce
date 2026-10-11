import express from "express";
import { getAdminStats } from "../controllers/analyticsController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { admin } from "../middlewares/adminMiddleware.js";

const analyticsRoutes = express.Router();

analyticsRoutes.get('/', protect, admin, getAdminStats);

module.exports = analyticsRoutes;