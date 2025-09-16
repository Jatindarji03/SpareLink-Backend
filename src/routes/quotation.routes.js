import { Router } from "express";
import authMidddleware from '../middleware/authMiddleware.js'
import {createQuotation,getQuotationsBySupplier,approveQuotation,rejectQuotation} from '../controllers/quotation.controller.js'

const route = Router ();

route.post('/request-quotation',authMidddleware,createQuotation);
route.get('/get-quotation/supplier/:id',authMidddleware,getQuotationsBySupplier);
route.put('/approve-quotation/:id',authMidddleware,approveQuotation);
route.delete('/reject-quotation/:id/rejected',authMidddleware,rejectQuotation);

export default route ;