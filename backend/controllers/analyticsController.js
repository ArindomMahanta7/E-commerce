import Order from "../model/orders.js";
import Product from "../model/product.js";
import User from "../model/user.js";

const getAdminStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments({});
    const totalProducts = await Product.countDocuments({});
    const totalUsers = await User.countDocuments({ role: 'user' });

    const orders = await Order.find({});
    const totalRevenue = orders.reduce((acc, item) => acc + item.totalAmount, 0);

    res.json({ totalOrders, totalProducts, totalUsers, totalRevenue });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default getAdminStats;