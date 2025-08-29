import mongoose  from "mongoose";
const mechanicSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
    },
    shopName:{
        type:String
    },
    phoneNumber:{
        type:String,
        unique:true,
    }
},{timestamps:true});
const Mechanic = mongoose.model('Mechanic', mechanicSchema);
export default Mechanic;