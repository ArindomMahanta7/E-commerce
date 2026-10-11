import user from "../model/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";
import { generateOTP, hashOTP } from "../utils/otp.js";

const generateToken = (id) => {
    return jwt.sign(
        { id },
        process.env.JWT_SECRET,
        { expiresIn: "30d" }
    );
};


// REGISTER USER
const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const normalizedEmail = email.trim().toLowerCase();
        const existingUser = await user.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        const salt = await bcrypt.genSalt(10);

        const hashedPassword = await bcrypt.hash(password, salt);

        const otp = generateOTP();

        const User = await user.create({
            name,
            email: normalizedEmail,
            password: hashedPassword,
            verified: false,
            otp: hashOTP(otp),
            otpExpiry: new Date(Date.now() + 5 * 60 * 1000)
        });

        try {
            const msg = `Welcome to our platform!

Your OTP for email verification is ${otp}.

This OTP expires in 5 minutes.`;

            await sendEmail(normalizedEmail, "OTP for email verification", msg);

        } catch (emailError) {
            console.error("Email sending failed:", emailError);

            return res.status(201).json({
                id: User._id,
                name: User.name,
                email: User.email,
                message: "Account created, but the verification email could not be sent. Please request a new OTP."
            });
        }

        return res.status(201).json({
            id: User._id,
            name: User.name,
            email: User.email,
            message: "User registered successfully. Please check your email for the OTP."
        });

    } catch (error) {
        console.error("Registration error:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                message: "User already exists"
            });
        }

        return res.status(500).json({
            message: "Error occurred while registering user"
        });
    }
};



const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const normalizedEmail = email.trim().toLowerCase();

        const User = await user.findOne({
            email: normalizedEmail
        });

        if (!User) {
            return res.status(400).json({
                message: "Invalid credentials"
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            User.password
        );

        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid credentials"
            });
        }

        
        if (!User.verified) {
            return res.status(403).json({
                message: "Please verify your email before logging in"
            });
        }

        return res.status(200).json({
            id: User._id,
            name: User.name,
            email: User.email,
            token: generateToken(User._id),
            message: "User logged in successfully"
        });

    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            message: "Error occurred while logging in user"
        });
    }
};



const getUsers = async (req, res) => {
    try {
        const users = await user.find({}).select("-password -otp");

        return res.status(200).json(users);

    } catch (error) {
        console.error("Get users error:", error);

        return res.status(500).json({
            message: "Error occurred while fetching users"
        });
    }
};



const verifyByOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                message: "Email and OTP are required"
            });
        }

        if (!/^\d{6}$/.test(String(otp))) {
            return res.status(400).json({
                message: "OTP must contain exactly 6 digits"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const User = await user.findOne({
            email: normalizedEmail
        });

        if (!User) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (User.verified) {
            return res.status(400).json({
                message: "Email is already verified"
            });
        }

        if (!User.otp || !User.otpExpiry) {
            return res.status(400).json({
                message: "No active OTP found. Please request a new OTP."
            });
        }

        if (User.otpExpiry.getTime() <= Date.now()) {
            return res.status(400).json({
                message: "OTP has expired. Please request a new OTP."
            });
        }

        const submittedHash = hashOTP(String(otp));

        const storedHashBuffer = Buffer.from(User.otp, "hex");
        const submittedHashBuffer = Buffer.from(submittedHash, "hex");

        const otpMatches = storedHashBuffer.length === submittedHashBuffer.length && crypto.timingSafeEqual(storedHashBuffer, submittedHashBuffer);
        if (!otpMatches) {
            return res.status(400).json({
                message: "Invalid OTP"
            });
        }

        User.verified = true;
        User.otp = null;
        User.otpExpiry = null;

        await User.save();

        return res.status(200).json({
            message: "Email verified successfully. You can now log in."
        });

    } catch (error) {
        console.error("OTP verification error:", error);

        return res.status(500).json({
            message: "Error occurred while verifying email"
        });
    }
};


export {
    registerUser,
    loginUser,
    getUsers,
    verifyByOTP
};