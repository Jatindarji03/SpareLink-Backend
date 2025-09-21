import { Router } from "express";
import authMidddleware from '../middleware/authMiddleware.js'
import {createQuotation,getQuotationsBySupplier,approveQuotation,rejectQuotation,getQuotationByMechanic} from '../controllers/quotation.controller.js'

const route = Router ();

route.post('/request-quotation',authMidddleware,createQuotation);
route.get('/get-quotation/supplier/:id',authMidddleware,getQuotationsBySupplier);
route.put('/approve-quotation/:id',authMidddleware,approveQuotation);
route.patch('/reject-quotation/:id/rejected',authMidddleware,rejectQuotation);
route.get("/get-quotation/mechanic",authMidddleware,getQuotationByMechanic);
export default route ;