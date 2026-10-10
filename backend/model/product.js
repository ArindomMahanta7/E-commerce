import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: String,
        required: true
    },
    stock: {
        type: Number,
        required: true,
        min: 0
    },
    imageURLs: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },

});

const Product = mongoose.model('Product', productSchema);

export default Product;