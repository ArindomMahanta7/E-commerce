import "dotenv/config"
import cors from "cors"
import express from "express"
import connectDB from "./config/db.js";
connectDB();
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
app.get("/" , (req ,res) => {
    res.send("E commerce backend is working");
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.listen(port ,() =>{
    console.log(`Server is running on port ${port}`)
})