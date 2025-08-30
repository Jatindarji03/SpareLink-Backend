import { Router } from "express";
import { createUser,loginUser,updateUser } from "../controllers/user.controller.js";
const router = Router();
router.post('/create-user', createUser);
router.post('/login', loginUser);
router.put('/update-user/:id', updateUser );
export default router;