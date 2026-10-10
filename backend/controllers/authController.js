import user from "../model/user.js"
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/sendEmail.js";

const generateToken = (id) => {
    return jwt.sign({id} , process.env.JWT_SECRET , {expiresIn : "7d"});
}


const registerUser = async (req , res) => {
    const {name , email , password} = req.body;
    try{
        const existingUser = await user.findOne({email});
        if(existingUser){
            return res.status(400).json({message : "User already exists"});
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password , salt);
        const User = await user.create({name , email , password : hashedPassword});
        if(User){
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const msg = `Welcome to our platform!
            Your OTP for registration is ${otp}`;

            await sendEmail(email , "OTP for registration" , msg);
            res.status(201).json({
                id : User._id,
                name : User.name,
                email : User.email,
                token : generateToken(User._id),
                message : "User registered successfully. Please check your email for OTP."
            })
        }
        else {
            res.status(400).json({message : "Invalid user data"});
        }
    } catch (error) {
        return res.status(500).json({message : "Error occurred while registering user"});
    }
}

const loginUser = async (req , res) => {
    const {email , password} = req.body;
    try{
        const User = await user.findOne({email});
        if(!User){
            return res.status(400).json({message : "Invalid credentials"});
        }
        const isMatch = await bcrypt.compare(password , User.password);
        if(!isMatch){
            return res.status(400).json({message : "Invalid credentials"});
        }
        res.status(200).json({
            id : User._id,
            name : User.name,
            email : User.email,
            token : generateToken(User._id),
            message : "User logged in successfully"
        })
    } catch (error) {
        return res.status(500).json({message : "Error occurred while logging in user"});
    }
}

const getUsers = async (req , res) => {
    try{
        const users = await user.find({}).select("-password");
        res.status(200).json(users);
    } catch (error) {
        return res.status(500).json({message : "Error occurred while fetching users"});
    }
}

export {registerUser , loginUser , getUsers};