import mongoose from "mongoose";
import Jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto"
import validator from "validator";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, ' Please enter your name ' ],
        maxLength: [30, 'Your name cannot exceed 30 characters'],
    }, 
    email: {
        type: String,
        required: [true, ' Please enter your email ' ],
    }, 
    role: {
        type: String,
        default: 'user'
    },
    fees: {
        amount: { type: Number, default: 0 },  // Base fee amount
        isPaid: { type: Boolean, default: false }, // Overall fee status
        history: [{
            month: { type: String, required: true },  // e.g., "January"
            year: { type: Number, required: true },  // e.g., 2025
            amount: { type: Number, required: true },  // Fee amount for that month
            isPaid: { type: Boolean, default: false } // Payment status
        }]
    },
    feesPaid: {
        type: Number,
        default: '0'
    },
    classs: { type: String, enum: [...Array(12).keys()].map((num) => `Class ${num + 1}`).concat("UG") },
    avatar: {
        public_id:{
            type: String,
        },
        url: {
            type: String,
        }
            
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
},
{timestamps: true}
)

userSchema.methods.getJwtToken = function () {
    return Jwt.sign({ id: this._id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    })
}

userSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(10).toString('hex');

    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    this.resetPasswordExpire = Date.now() + 30 * 60 * 1000;

    return resetToken
}

userSchema.methods.comparePassword = async function (enteredPassword) {;
     return validator.equals(enteredPassword, this.password)
}

export default mongoose.model("User", userSchema)
