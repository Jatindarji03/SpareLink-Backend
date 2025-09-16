import { populate } from "dotenv";
import Quotation from "../models/quotationModel.js";
import Mechanic from "../models/mechanicModel.js";
import User from "../models/userModel.js";

//This Method will Called When Mechanic to request a quotation
const createQuotation = async (req, res) => {
    try {
        const { mechanicId, supplierId, product } = req.body;
        if (!mechanicId || !supplierId || !product) {
            return res.status(400).json({ message: "MechanicID , SupplierID And Product Details Required" });
        }
        const newQuotation = new Quotation({
            mechanicId: mechanicId,
            supplierId: supplierId,
            product: product,
        });
        await newQuotation.save();
        return res.status(200).json({ message: "Quotation created", data: newQuotation });
    } catch (error) {
        console.log('error', error);
        return res.status(500).json({ message: "Internal Server Error ", error: error.message });
    }
};
//This Method Is Called In Supplier Side to See there Quotation 
const getQuotationsBySupplier = async (req, res) => {
    try {
        const id = req.params.id;
        if (!id) {
            return res.status(400).json({ message: "Supplier Id is required" });
        }

        const quotations = await Quotation.find({ supplierId: id , status:'pending'})
            .populate('product.sparePartId', 'name ')
            .populate('mechanicId','name email')
            .sort({ createdAt: -1 });

        if (quotations.length === 0) {
            return res.status(404).json({ message: "There is no quotation currently" })
        }
        return res.status(200).json({ message: "Quotation Fetched", data: quotations });
    } catch (error) {
        console.log('error', error);
        return res.status(500).json({ message: "Internal Server Error ", error: error.message });
    }
}
//This Method Is Called In Supplier Side To Approved Quotation And Update With its price and discount to send to mechanic 
const approveQuotation = async  (req, res) => {
    try {
        const id = req.params.id;
        const {product,deliveryDate,paymentTerms,additionalNotes} = req.body
        if(!product || !deliveryDate || !paymentTerms){
            return res.status(400).json({message:"Qty And Price , delivery date and payment term is required "});
        }
        const updatedData ={
            product:product,
            deliveryDate:deliveryDate,
            paymentTerms:paymentTerms,
            additionalNotes:additionalNotes,
            status:'approved'
        };
        const approvedQuotation = await Quotation.findByIdAndUpdate(id,updatedData,{new:true});
        if(!approvedQuotation){
            return res.status(404).json({message:"Quotation not found"})
        }
        return res.status(200).json({message:'quotation approved ',data:approvedQuotation});
    } catch (error) {
        console.log('error', error);
        return res.status(500).json({ message: "Internal Server Error ", error: error.message });
    }
}
//This Method is Called In Supplier Side to Reject Quotation 
const rejectQuotation = async (req, res) => {
    try {
        const quotationId = req.params.id;
        if (!quotationId) {
            return res.status(400).json({ message: "Quotation Id is required" });
        }
        await Quotation.findByIdAndDelete(quotationId);
        return res.status(200).json({ message: 'Quotation Rejected' });
    } catch (error) {
        console.log('error', error);
        return res.status(500).json({ message: "Internal Server Error ", error: error.message });
    }
}


export { createQuotation, getQuotationsBySupplier, approveQuotation, rejectQuotation };