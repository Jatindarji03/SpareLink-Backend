import { Router } from "express";
import authMiddleware from '../middleware/authMiddleware.js'
import { createCategory,getCategory,updateCategory,deleteCategory } from "../controllers/category.controller.js";

const router = Router();

router.post('/create-category',authMiddleware,createCategory);
router.get('/get-category',authMiddleware,getCategory);
router.put('/update-category/:id',authMiddleware,updateCategory);
router.delete('/delete-category/:id',authMiddleware,deleteCategory);

export default router;