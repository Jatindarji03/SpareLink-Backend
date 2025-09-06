import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import multers from "../middleware/multers.js";
import { createCarModel,updateCarModel,deleteCarModel,getCarModel } from "../controllers/carModel.controller.js";
const router =Router();

router.post('/create-car-model',authMiddleware,multers.single('image'),createCarModel);
router.get('/get-car-model',authMiddleware,getCarModel);
router.delete('/delete-car-model/:id',authMiddleware,deleteCarModel);
router.put('/update-car-model/:id',authMiddleware,updateCarModel);

export default router;