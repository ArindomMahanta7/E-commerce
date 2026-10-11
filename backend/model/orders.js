import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId , ref: "user" , required : true
    },
    products : {
        product : {
        type: mongoose.Schema.Types.ObjectId , ref : "product" , required : true},
        quantity : {
            type : Number , 
            required : true
        },
        price : {
            type : Number , 
            required : true
        }
    },
    totalAmount : {
        type : Number , 
        required : true
    },
    address : {
        fullname : {type : String , required : true},
        street : {type : String , required : true},
        city : {type : String , required : true},
        state : {type : String , required : true},
    },
    paymentId : { type : String },
    status :{ type : String , enum : ["pending" , "shipped" , "delivered"] , default : "pending"},
})

export default mongoose.model("Order", orderSchema);