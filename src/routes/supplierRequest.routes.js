import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import checkPermission from "../middleware/checkPermission.js";
import { getSupplierRequests } from "../controllers/supplierRequest.controller.js";
const router = Router();

router.get('/get-supplier-requests' ,authMiddleware, checkPermission('suppliers','read'),getSupplierRequests);

export default router;