import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";

import { getSupplierRequests,supplierRequestApprovel,getApprovedSupplier,getSupplierById } from "../controllers/supplierRequest.controller.js";
const router = Router();

router.get('/get-supplier-requests' ,authMiddleware,getSupplierRequests);
router.put('/supplier-request-approvel/:id' ,authMiddleware,supplierRequestApprovel);
router.get('/get-supplier/mechanic',authMiddleware,getApprovedSupplier);
router.get('/get-supplierById/:id',authMiddleware,getSupplierById)
export default router;