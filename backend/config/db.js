import mongoose from "mongoose";

const connectDB = async () => {
    const uri = process.env.MONGO_URI?.trim();

    if (!uri) {
        throw new Error("MONGO_URI is not set. Add it to backend/.env.");
    }

    try {
        await mongoose.connect(uri);
        console.log("MongoDB connected successfully");
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        const sanitizedMessage = message.replace(
            /(mongodb(?:\+srv)?:\/\/)[^/@\s]+@/gi,
            "$1<redacted>@"
        );

        throw new Error(`MongoDB connection failed: ${sanitizedMessage}`, { cause: error });
    }
};

export default connectDB;