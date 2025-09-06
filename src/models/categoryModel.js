import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    name:{
        type:String,
        unique:true,
        required:true
    }
},{timestamps:true})

const Category = new mongoose.model('Category',categorySchema);
export default Category;