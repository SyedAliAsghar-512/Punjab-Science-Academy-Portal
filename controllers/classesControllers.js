import Classes from "../backend/models/classes.js"
import catchAsyncErrors from "../backend/middlewares/catchAsyncErrors.js"
import attendance from "../backend/models/attendance.js"

// Get logged in user orders
export const myClasses = catchAsyncErrors(async (req, res, next) => {
    const classes = await Classes.find({ user: req.user._id })

    res.status(200).json({
        classes
    })
})

//get attendance 
export const myAttendance = catchAsyncErrors(async (req, res, next) => {
    const Attendance = await attendance.findOne({classid: req?.params?.id})

    res.status(200).json({
        Attendance
    })
})