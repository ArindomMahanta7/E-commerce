import express from 'express';
import multer from 'multer';
import {getProducts, getProductById, createProduct, updateProduct, deleteProduct} from '../controllers/productController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { admin } from '../middlewares/adminMiddleware.js';

const upload = multer({ dest: 'uploads/' });

const productRoutes = express.Router();

productRoutes.route('/').get(getProducts).post(protect, admin, upload.single('image'), createProduct);
productRoutes.route('/:id').get(getProductById).put(protect, admin, upload.single('image'), updateProduct).delete(protect, admin, deleteProduct);

export default productRoutes;