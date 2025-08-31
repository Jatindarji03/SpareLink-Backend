import { Router } from "express";
import { createUser,loginUser,updateUser } from "../controllers/user.controller.js";
import authMiddleware from "../middleware/authMiddleware.js";
const router = Router();
router.post('/create-user', createUser);
router.post('/login', loginUser);
router.put('/update-user/:id',authMiddleware, updateUser );
export default router;