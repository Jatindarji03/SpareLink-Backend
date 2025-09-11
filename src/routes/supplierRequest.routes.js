import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";

import { getSupplierRequests,supplierRequestApprovel } from "../controllers/supplierRequest.controller.js";
const router = Router();

router.get('/get-supplier-requests' ,authMiddleware,getSupplierRequests);
router.put('/supplier-request-approvel/:id' ,authMiddleware,supplierRequestApprovel);
export default router;