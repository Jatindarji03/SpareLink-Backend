import { Router } from "express";
import authMiddleWare from '../middleware/authMiddleware.js'
import { createOrder,getOrder } from "../controllers/order.controller.js";
const router = Router();
router.post('/create-order',authMiddleWare,createOrder);
router.get('/get-order',authMiddleWare,getOrder)
export default router;