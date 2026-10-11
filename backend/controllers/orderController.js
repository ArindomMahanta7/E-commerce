import { text } from "express";
import Order from "../model/orders.js";
import sendEmail from "../utils/sendEmail.js";

const addOrderItems = async (req, res) => {
    try {
        const { products, totalAmount, address, paymentId } = req.body;

    if(!products || products.length === 0 || !totalAmount || !address || !paymentId) {
        return res.status(400).json({ message : "invalid order data"});
    }
    else {
        const order = new Order({
            user : req.user._id,
            items , 
            totalAmount,
            address,
            paymentId
        });
        await order.save();
        await sendEmail({
            to : req.user.email ,
            subject : "order created successfully",
            text : `Your order has been created successfully. Your order id is ${order._id} and the total amount is ${totalAmount}. Thank you for shopping with us.`
        });
        res.status(201).json({ message : "order created successfully" , order});
    }} catch (error) {
        res.status(500).json({ message : "Internal server error"});
    }
};


const getMyOrders = async (req, res) => {
    try {
        const orders =  await Order.find({ user: req.user._id }).populate("products.product", "name price");
        res.status(200).json({ orders });
    } catch (error) {
        res.status(500).json({ message : "Internal server error"});
    }
};

const getOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate("user", "name email").populate("products.product", "name price"); 
        res.json(orders);
    }  catch (error) {
        res.status(500).json({message : "internal server error"});
    }
};
const getOrdersById = async (req, res) => {
    try {
        const order = await Order.findById({user : req.user._id}).populate("user", "name email").populate("products.product", "name price");
        res.json(order);
    }  catch (error) {
        res.status(500).json({message : "internal server error"});
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const {status} = req.body;
        const order = await Order.findById(req.params.id);
        if(!order) {
            return res.status(404).json({ message : "order not found"});
        }
        else {
            order.status = status ;
            await order.save();
            res.json({ message : "order status updated successfully" , order});
        }
    }catch (error) {
        res.status(500).json({ message : "Internal server error"});
    }
}

export {addOrderItems, getMyOrders, getOrders, updateOrderStatus, getOrdersById};