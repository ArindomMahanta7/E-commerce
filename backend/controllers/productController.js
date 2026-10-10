import Product from "../model/product.js";

import cloudinary from "../config/cloudinary.js";

const getProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: "Error fetching products" })
    }
};

const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: "Error fetching product" });
    }
};

const createProduct = async (req, res) => {
    try {
        const { name, description, price ,catagory, stock  } = req.body;
        let imageURLs = '';
        if(req.file){
            const result = await cloudinary.uploader.upload(req.file.path);
            imageURLs = result.secure_url;
        }
        const newProduct = new Product({
            name,
            description,
            price ,
            category , 
            stock ,
            imageURLs
        });
        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    }catch (error) {
        res.status(500).json({ message: "Error creating product" });
    }
};

const updateProduct = async (req, res) => {
    try {
        const { name, description, price ,category, stock  } = req.body;
        const product = await Product.findById(req.params.id);
        if (product) {
            product.name = name || product.name;
            product.description = description || product.description;
            product.price = price || product.price;
            product.category = category || product.category;
            product.stock = stock || product.stock;
        }
       if(req.file){
            const result = await cloudinary.uploader.upload(req.file.path);
            product.imageURLs = result.secure_url;
        }
        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } catch (error) {
        res.status(500).json({ message: "Error updating product" });
    }
};


const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }   
        await product.remove();
        res.json({ message: "Product deleted" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting product" });
    }
};

export { getProducts, getProductById, createProduct, updateProduct, deleteProduct };