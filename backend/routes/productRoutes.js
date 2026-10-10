import express from 'express';
import multer from 'multer';
import {getProducts, getProductById, createProduct, updateProduct, deleteProduct} from '../controllers/productController.js';
import { protect } from '../middleware/authMiddleware.js';
import { admin } from '../middleware/adminMiddleware.js';

const upload = multer({ dest: 'uploads/' });

const productRoutes = express.Router();

productRoutes.route('/').get(getProducts).post(protect, admin, upload.single('image'), createProduct);
productRoutes.route('/:id').get(getProductById).put(protect, admin, upload.single('image'), updateProduct).delete(protect, admin, deleteProduct);

module.exports = productRoutes;