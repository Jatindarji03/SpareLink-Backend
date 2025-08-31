import SupplierRequest from "../models/supplierRequestModel.js";
const getSupplierRequests = async (req,res)=>{
    try{
        const supplierRequests = await SupplierRequest.find().populate('userId','name email');
        if(supplierRequests.length === 0){
            return res.status(404).json({message:"No supplier requests found"});
        }
        return res.status(200).json({data:supplierRequests, message:"Supplier requests fetched successfully"});
    }catch(error){
        return res.status(500).json({ message: "Internal server error" });
    }
}
export {getSupplierRequests};