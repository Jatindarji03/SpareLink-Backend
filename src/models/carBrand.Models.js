import mongoose from "mongoose";
const CarBrandSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true,
        trim:true
    },
    logo:{
        type:String,
        required:true
    }
},{timestamps:true});

const CarBrand=mongoose.model("CarBrand",CarBrandSchema);
export default CarBrand;