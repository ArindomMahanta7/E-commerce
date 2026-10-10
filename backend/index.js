import "dotenv/config";
import cors from "cors";
import express from "express";

import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
// import orderRoutes from "./routes/orderRoutes.js";
// import paymentRoutes from "./routes/paymentRoutes.js";
// import analyticsRoutes from "./routes/analyticsRoutes.js";

const app = express();
const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());

// Root route
app.get("/", (req, res) => {
    res.send("E commerce backend is working");
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
// app.use("/api/orders", orderRoutes);
// app.use("/api/payment", paymentRoutes);
// app.use("/api/analytics", analyticsRoutes);

// Connect to database before starting server
const startServer = async () => {
    try {
        await connectDB();

        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error.message);
        process.exit(1);
    }
};

startServer();