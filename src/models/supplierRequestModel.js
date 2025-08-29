import mongoose from "mongoose";
const supplierRequestSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
    },
    shopName:{
        type:String,
    },
    phoneNumber:{
        type:String,
        unique:true,
    },
    status:{
        type:String,
        enum:['pending','approved','rejected'],
        default:'pending'
    },
    address:{
        type:String,
    }
}, { timestamps: true });
const SupplierRequest = mongoose.model("SupplierRequest", supplierRequestSchema);
export default SupplierRequest;