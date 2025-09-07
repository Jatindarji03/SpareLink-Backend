import { Router } from "express";
import authMiddleware from '../middleware/authMiddleware.js';
import multers from '../middleware/multers.js';
import { addSparePart ,getSparePartBySupplierId,updateSparePart,deleteSparePart,getSparePart,getSparePartById} from "../controllers/sparepart.controller.js";

const router = Router();
router.post('/add-spare-part',authMiddleware,multers.single('image'),addSparePart);
router.get('/spare-parts/supplier/:id',authMiddleware,getSparePartBySupplierId);
router.get('/spare-parts/mechanic',authMiddleware,getSparePart);
router.get('/spare-part-details/:id',authMiddleware,getSparePartById);
router.delete('/delete-spare-part/supplier/:id',authMiddleware,deleteSparePart);
router.put('/update-spare-part/supplier/:id',authMiddleware,updateSparePart);
export default router;