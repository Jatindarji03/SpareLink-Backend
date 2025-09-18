import { Router } from "express";
import { createUser,loginUser,updateUser ,viewProfile , forgotPassword , resetPassword , verifyOtp} from "../controllers/user.controller.js";
import authMiddleware from "../middleware/authMiddleware.js";
const router = Router();
router.post('/create-user', createUser);
router.post('/login', loginUser);
router.put('/update-user/:id',authMiddleware, updateUser );
router.get('/profile',authMiddleware, viewProfile);
router.post('/forgot-password',forgotPassword);
router.post('/verify-otp',verifyOtp);
router.post('/reset-password',resetPassword);

export default router;