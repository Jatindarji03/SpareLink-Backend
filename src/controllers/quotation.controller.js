import { populate } from "dotenv";
import Quotation from "../models/quotationModel.js";
import Mechanic from "../models/mechanicModel.js";
import User from "../models/userModel.js";

import {io, connectedUsers } from "../Socket/socket.js";
//This Method will Called When Mechanic to request a quotation
const createQuotation = async (req, res) => {
  try {
    const { mechanicId, supplierId, product } = req.body;

    if (!mechanicId || !supplierId || !product) {
      return res
        .status(400)
        .json({ message: "MechanicID, SupplierID and Product details required" });
    }

    // Save quotation
    const newQuotation = new Quotation({
      mechanicId,
      supplierId,
      product,
    });

    await newQuotation.save();
    const quotations = await Quotation.find({_id:newQuotation._id})
            .populate('product.sparePartId', 'name ')
            .populate('mechanicId','name email');
    
    
    // 🔹 Send to supplier via socket if connected
    const targetSocketId = connectedUsers.get(supplierId);

    if (targetSocketId) {
      io.to(targetSocketId).emit("new-quotation-request", quotations);
    //   console.log(
    //     `Quotation sent to supplier ${supplierId} via socket ${targetSocketId}`
    //   );
    } else {
      console.log(`Supplier ${supplierId} is not connected.`);
    }

    return res
      .status(200)
      .json({ message: "Quotation created", data: newQuotation });
  } catch (error) {
    console.log("error", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

//This Method Is Called In Supplier Side to See there Quotation 
const getQuotationsBySupplier = async (req, res) => {
    try {
        const id = req.params.id;
        console.log(id);
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
//  Get Quotations of Mechanic
// ✅ Get Quotations of Mechanic
const getquotationofmechanic = async (req, res) => {
  try {
    const userId = req.user.id; // assuming auth middleware adds req.user
   
    if (!userId) {
      return res.status(404).json({ message: "User ID not found" });
    }

    const quotations = await Quotation.find({ mechanicId: userId })
      .populate("mechanicId", "name email phoneNumber") // mechanic details
      .populate({
        path: "supplierId",  // Supplier reference
        select: "storeName status address userId",
        populate: {
          path: "userId",     // populate User inside Supplier
          select: "name email phoneNumber"
        }
      })
      .populate("product.sparePartId", "name category price"); // spare part details
      console.log(quotations);

    if (!quotations || quotations.length === 0) {
      return res.status(404).json({ message: "No quotations found" });
    }

    return res.status(200).json({
      data: quotations,
      message: "Successfully fetched quotations",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};





export { createQuotation, getQuotationsBySupplier, approveQuotation, rejectQuotation,getquotationofmechanic };