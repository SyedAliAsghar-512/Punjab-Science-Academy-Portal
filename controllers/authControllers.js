import catchAsyncErrors from "../backend/middlewares/catchAsyncErrors.js"
import User from "../backend/models/user.js"
import ErrorHandler from "../backend/utils/errorHandler.js"
import sendToken from "../backend/utils/sendToken.js";
import sendEmail from "../backend/utils/sendEmail.js"
import {getResetPasswordTemplate} from "../backend/utils/emailTemplates.js"
import crypto from "crypto"
import {delete_file, upload_file} from "../backend/utils/cloudinary.js"
import bcrypt from "bcryptjs"



//registeruser
export const registerUser = catchAsyncErrors(async (req, res, next) => {
    const { name, classs } = req.body; // Extract classs from request body
  
    await User.create({
      name,
      classs // Store classs in the database
    });
    res.status(200).json({
        message: "enrolled"
    })
  });
  

//loginuser
export const loginUser = catchAsyncErrors(async (req, res , next) => {
    const { email, password } = req.body;
    
if (!email || !password ) {
    return next (new ErrorHandler("Please Enter Login ID and Password",400))
}

const user = await User.findOne({ email }).select("+password");

if (!user ) {
    return next (new ErrorHandler("Invalid Login ID or Password",401))
}

const IsPasswordMatched = await User.findOne({email,password});

if (!IsPasswordMatched) {
    return next (new ErrorHandler("Invalid Login ID or Password",401))
}
sendToken(user, 200, res);
});

//logoutuser
export const logoutUser = catchAsyncErrors(async (req, res , next) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })
    res.status(200).json({
        message: "logged-out"
    })
})

//upload user avatar
export const uploadAvatar = catchAsyncErrors(async (req, res, next) => {
     
    const avatarResponse = await upload_file(req.body.avatar, "shopholic/avatar")

    if (req?.user?.avatar?.url) {
        await delete_file(req?.user?.avatar?.public_id)
    }

    const user = await User.findByIdAndUpdate(req?.user?._id, {
        avatar: avatarResponse,
    })

    res.status(200).json({
        user,
    })
})

//forgetpassworduser
export const forgetPassword = catchAsyncErrors(async (req, res , next) => {

const user = await User.findOne({ email: req.body.email });

if (!user ) {
    return next (new ErrorHandler("user not found with this email",404))
}

const resetToken = user.getResetPasswordToken();

//console.log("reset token (forgot)",resetToken)

await user.save();

const resetUrl = `${process.env.FRONTEND_URL}/api/v1/password/reset/${resetToken}`

const message = getResetPasswordTemplate(user?.name, resetUrl);

try {
   await sendEmail({
    email: user.email,
    subject: "Shopholic Password Recovery",
    message,
   })
   res.status(200).json({
    message: `email sent to: ${user.email}`
   })
}
catch (error) {
    user.resetPasswordToken =  undefined
    user.resetPasswordExpire = undefined

    await user.save()
    return next (new ErrorHandler(error?.message, 500))
}
});

//resetpassword
export const resetPassword = catchAsyncErrors(async (req, res , next) => {

    const token = req.params.token

    const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex')

    //console.log("reset token (reset)",resetPasswordToken)
   
    const user = await User.findOne({
       resetPasswordToken,
       resetPasswordExpire: { $gt : Date.now() }
    })
    if (!user ) {
       return next (new ErrorHandler("Password reset token is invalid or has been expired",401))
   }
   if (req.body.password !== req.body.confirmPassword) {
       return next (new ErrorHandler("Password does not match",400))
   }
   user.password = req.body.password
   
   user.resetPasswordToken =  undefined
   user.resetPasswordExpire = undefined
   
   await user.save()
   
   sendToken(user, 200, res);
   })

//getuserinfo
   export const getUserProfile = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req?.user?._id)
    res.status(200).json({
        user,
    })
})

//Changepassword
export const updatePassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');

    // Check previous user password
    const isMatched = await user.comparePassword(req.body.oldPassword)
    if (!isMatched) {
        return next(new ErrorHandler('Old password is incorrect'));
    }

    user.password = req.body.password;
    await user.save();

    sendToken(user, 200, res) 

})

// Update user profile   =>   /api/v1/me/update
export const updateProfile = catchAsyncErrors(async (req, res, next) => {
    const newUserData = {
        gmail: req.body.gmail,
        phoneno: req.body.phoneno,
        address: req.body.address
    }
    const user = await User.findByIdAndUpdate(req.user._id, newUserData, {
        new: true
    })

    res.status(200).json({
        success: true,
        user
    })
})

// Get all users
export const allUsers = catchAsyncErrors(async (req, res, next) => {
    const users = await User.find();

    res.status(200).json({
        success: true,
        users
    })
})


// Get user details 
export const getUserDetails = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorHandler(`User does not found with id: ${req.params.id}`))
    }

    res.status(200).json({
        success: true,
        user
    })
})

// Update user profile
export const updateUser = catchAsyncErrors(async (req, res, next) => {
    const { name, classs } = req.body;

    const newUserData = {
        name,
        classs,
    };

    const user = await User.findByIdAndUpdate(req.params.id, newUserData, { new: true });

    res.status(200).json({
        success: true,
        user,
    });
});


// Delete user
export const deleteUser = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorHandler(`User does not found with id: ${req.params.id}`))
    }

    if(user?.avatar?.public_id) {
        await delete_file(user?.avatar?.public_id)
    }

    await user.remove();

    res.status(200).json({
        success: true,
    })
})

export const dashboardStats = catchAsyncErrors(async (req, res, next) => {
    try {
        // Fetch total fees collected for each month
        const totalFeesCollected = await User.aggregate([
            { $match: { role: "user", "fees.history": { $exists: true, $not: { $size: 0 } } } }, // Ensure history exists
            { $unwind: "$fees.history" }, // Unwind fees.history array
            { $match: { "fees.history.isPaid": true } }, // Only count paid fees
            { 
                $group: { 
                    _id: { month: "$fees.history.month", year: "$fees.history.year" }, 
                    totalFees: { $sum: "$fees.history.amount" } 
                } 
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } } // Sort by year & month
        ]);

        res.status(200).json({
            success: true,
            totalFeesCollected
        });

    } catch (error) {
        console.error("❌ Server Error:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
});







// Fetch all students with their fees
export const getStudents = catchAsyncErrors(async (req, res, next) => {
    const students = await User.find({ role: "user" }).select("name email classs fees");

    res.status(200).json({
        success: true,
        students,
    });
});

export const updateFeeStatus = catchAsyncErrors(async (req, res, next) => {
    const { history } = req.body; // Expecting fees history array
    const student = await User.findById(req.params.id);

    if (!student) {
        return next(new ErrorHandler("Student not found", 404));
    }

    if (!history || !Array.isArray(history)) {
        return next(new ErrorHandler("Invalid fee data", 400));
    }

    // Update fee history
    history.forEach(({ month, year, isPaid, amount }) => {
        const feeEntry = student.fees.history.find(entry => entry.month === month && entry.year === year);
        if (feeEntry) {
            feeEntry.isPaid = isPaid;
            feeEntry.amount = amount;
        } else {
            student.fees.history.push({ month, year, isPaid, amount });
        }
    });

    // Set overall isPaid status only if all fees are paid
    student.fees.isPaid = student.fees.history.length > 0 && student.fees.history.every(entry => entry.isPaid);

    await student.save();

    res.status(200).json({
        success: true,
        message: "Fee status updated successfully",
        student
    });
});



// Delete a fee record (Only Clears Fee Data, Keeps Student)
export const deleteFee = catchAsyncErrors(async (req, res, next) => {
    const student = await User.findById(req.params.id);

    if (!student) {
        return next(new ErrorHandler("Student not found", 404));
    }

    await student.deleteOne(); // Deletes the user completely

    res.status(200).json({
        success: true,
        message: "Student record deleted successfully",
    });
});

