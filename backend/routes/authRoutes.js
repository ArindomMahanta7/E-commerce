import express from "express";
import { registerUser, loginUser, getUsers } from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { admin } from "../middlewares/adminMiddleware.js";
const authRoutes = express.Router();

authRoutes.post('/register', registerUser);
authRoutes.post('/login', loginUser);
authRoutes.get('/users', protect, admin, getUsers);

export default authRoutes;