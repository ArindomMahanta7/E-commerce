import express from "express";
import { getAdminStats } from "../controllers/analyticsController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { admin } from "../middlewares/adminMiddleware.js";

const router = express.Router();

router.get('/', protect, admin, getAdminStats);

module.exports = router;