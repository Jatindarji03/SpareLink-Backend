import SupplierRequest from "../models/supplierRequestModel.js";
import sendMail from "../utils/sendMail.js";
import Supplier from "../models/supplierModel.js";
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
        console.log(id,status);
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
                shopName:updatedRequest.shopName,
                status:'approved'
            });
            await newSupplier.save();
            await updatedRequest.deleteOne();
        }
        return res.status(200).json({message:"Supplier request status updated successfully"});
    }catch(error){
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export {getSupplierRequests,supplierRequestApprovel};