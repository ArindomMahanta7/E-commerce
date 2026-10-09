import mongoose from "mongoose"
const connectDB = async () => {
    try{
        const connection = await mongoose.connect(process.env.MONGO_URI);
            console.log("mongo db is connected successfully")
    }
    catch(error){
        console.log("MONGO DB NOT CONNETED")
        process.exit(1)
    }
}

export default connectDB;