import { Router} from "express";
import multers from '../middleware/multers.js'
import authMiddleware from '../middleware/authMiddleware.js'
import { createBrand,getBrandDetails,updateBrand,deleteBrand } from "../controllers/carBrand.controller.js";
const router=Router();

router.post('/create-brand',authMiddleware,multers.single('logo'),createBrand);
router.get('/get-brand',authMiddleware,getBrandDetails);
router.delete('/delete-brand/:id',authMiddleware,deleteBrand);
router.put('/update-brand/:id',authMiddleware,multers.single('image'),updateBrand);
export default router;