import mongoose from "mongoose";
const SupplierSparePartSchema = new mongoose.Schema({
    supplierId: {
        type: mongoose.Schema.ObjectId,
        ref: "Supplier",
        required: true,
    },
    sparePartId: {
        type: mongoose.Schema.ObjectId,
        ref: "SparePart",
        required: true,
    },
    price:{
        type:Number,
        required:true
    }
}, { timestamps: true });

const SupplierSparePart = new mongoose.model("SupplierSparePart", SupplierSparePartSchema);
export default SupplierSparePart;