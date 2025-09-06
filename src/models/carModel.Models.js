import mongoose from "mongoose";
const carModelSchema = new mongoose.Schema({
    carModel:{
        type:String,
        unique:true,
        required:true
    },
    carModelImage:{
        type:String,
        required:true
    },
    carBrand:{
        type:mongoose.Schema.ObjectId,
        ref:"CarBrand",
        required:true
    }
},{timestamps:true});

const CarModel = mongoose.model('CarModel',carModelSchema);
export  default CarModel;