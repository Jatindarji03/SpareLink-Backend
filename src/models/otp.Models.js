import mongoose from 'mongoose';
const OTPSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true
    },
    otp:{
        type:Number,
        required:true
    },
    createdAt:{
        type:Date,
        default:Date.now(),
        expires:2000 // Expires in 2 min
    }
});
const OTP = new mongoose.model('OTP',OTPSchema);
export default OTP;