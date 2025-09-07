import mongoose from "mongoose";
const SparePartSchema = new mongoose.Schema({
    supplierId:{
        type:mongoose.Types.ObjectId,
        ref:"Supplier",
        required:true
    },
    name:{
        type:String,
        required:true,
        trim:true
    },
    image:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    categoryId:{
        type:mongoose.Schema.ObjectId,
        ref:"Category",
        required:true
    },
    specifications:{
        type:String,
        required:true
    },
     brandId: [{
        type: mongoose.Schema.ObjectId,
        ref: "CarBrand",
        required: true
    }],
    modelId:[{
        type:mongoose.Schema.ObjectId,
        ref:"CarModel",
        required:true
    }],
    variant:[{
        type:String,
        required:true
    }]

},{timestamps:true});

const SparePart = new mongoose.model("SparePart",SparePartSchema);
export default SparePart;