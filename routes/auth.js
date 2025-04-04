import express from "express";
import {registerUser, loginUser, logoutUser, forgetPassword, resetPassword, getUserProfile, updatePassword, updateProfile, allUsers, getUserDetails, updateUser, deleteUser, uploadAvatar, dashboardStats, getStudents, updateFeeStatus, deleteFee} from "../controllers/authControllers.js"
import {authorizeRoles, isAuthenticatedUser} from "../backend/middlewares/auth.js"


const router = express.Router();

router.route("/register").post(isAuthenticatedUser, authorizeRoles("admin"), registerUser);
router.get("/admin/dashboard-stats", isAuthenticatedUser, authorizeRoles("admin"), dashboardStats);
router.get("/admin/students", isAuthenticatedUser, authorizeRoles("admin"), getStudents);
router.put("/admin/fees/:id", isAuthenticatedUser, authorizeRoles("admin"), updateFeeStatus);
router.delete("/admin/fees/:id", isAuthenticatedUser, authorizeRoles("admin"), deleteFee);
router.route("/login").post(loginUser);
router.route("/logout").get(logoutUser);
router.route("/forgot/password").post(forgetPassword);
router.route("/password/reset/:token").put(resetPassword);
router.route("/me").get(isAuthenticatedUser, getUserProfile);
router.route("/me/updateprofile").put(isAuthenticatedUser, updateProfile);
router.route("/password/update").put(isAuthenticatedUser, updatePassword);
router.route("/me/upload_avatar").put(isAuthenticatedUser, uploadAvatar);
router.route("/admin/users").get(isAuthenticatedUser, authorizeRoles("admin"), allUsers);
router.route("/admin/users/:id").get(isAuthenticatedUser, authorizeRoles("admin"), getUserDetails).put(isAuthenticatedUser, authorizeRoles('admin'), updateUser)
.delete(isAuthenticatedUser, authorizeRoles('admin'), deleteUser);

export default router;