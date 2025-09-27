import SupplierRequest from "../models/supplierRequestModel.js";
import sendMail from "../utils/sendMail.js";
import Supplier from "../models/supplierModel.js";
import User from '../models/userModel.js'
//Get Supplier Requests Whose Status is Pending 
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

//Approve or Reject Supplier Request
const supplierRequestApprovel = async (req,res)=>{
    try{
        const {id} = req.params;
        const {status} = req.body;
        const validStatuses = ['approved','rejected'];
        if(!validStatuses.includes(status)){
            return res.status(400).json({message:"Invalid status value"});
        }
        const updatedRequest = await SupplierRequest.findByIdAndUpdate(id,{status:status},{new:true}).populate('userId','name email');
        if(!updatedRequest){
            return res.status(404).json({message:"Supplier request not found"});
        }
        //Currently Sending Mail to only approved supplier leter it will add to reject also
        if(status === 'approved'){
            const subject = "Your SpareLink Account Has Been Approved";
            const text=`Good news! Your supplier account on SpareLink has been approved.
            You can now:
            1.Add and manage your product catalog
            2.Receive quotation requests from mechanics
            3.espond with offers and start selling
            👉 Log in to start listing your products: [Login Button / Link]
            We’re excited to help you grow with SpareLink 🚀
            Best Regards,
            The SpareLink Team`;
            sendMail(updatedRequest.userId.email,subject,text);

            const newSupplier = new Supplier({
                userId:updatedRequest.userId._id,
                storeName:updatedRequest.storeName,
                address:updatedRequest.address,
                status:'approved'
            });
            await newSupplier.save();
            await updatedRequest.deleteOne();
        }else if(status === 'rejected'){
            const subject = 'Your SpareLink Supplier Request Has Been Rejected';
            const message = `Hello,
            We appreciate your interest in becoming a supplier on SpareLink.  
            After reviewing your application, we regret to inform you that your supplier request has not been approved at this time.
            Possible reasons may include:
            1. Incomplete or inaccurate information provided  
            2. Failure to meet our supplier requirements  
            3. Other eligibility concerns
            We value your interest and encourage you to try again in the future.
            Best Regards,  
            The SpareLink Team`;
            sendMail(updatedRequest.userId.email,subject,message);
            await User.findByIdAndDelete(updatedRequest.userId);
            await updatedRequest.deleteOne();
        }
        return res.status(200).json({message:"Supplier request status updated successfully"});
    }catch(error){
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

//Get Approved Supplier to show mechanic
const getApprovedSupplier = async (req,res)=>{
    try{
        const suppliers = await Supplier.find().populate('userId','name email');
        if(suppliers.length===0){
            return res.status(404).json({message:"No supplier requests found"});
        }
        return res.status(200).json({message:'Supplier Fetched',data:suppliers});
    }catch(error){
        console.log(`error ${error}`);
        return res.status(500).json({message:'Internal server error ',error:error});
    }
}

//Get Supplier Details From its id
const getSupplierById = async (req,res)=>{
    try{
        const id = req.params.id;
        if(!id){
            return res.status(400).json({message:'Id is required'})
        }
        const supplier = await Supplier.findById(id).populate('userId','name email');
        if(!supplier){
            return res.status(404).json({message:'Supplier Not Found',data:supplier});
        }
        return res.status(200).json({message:'Supplier Data Feteched',data:supplier});
    }catch(error){
        return res.status(500).json({message:'Internal Server error',error:error});
    }
}
export {getSupplierRequests,supplierRequestApprovel,getApprovedSupplier,getSupplierById};