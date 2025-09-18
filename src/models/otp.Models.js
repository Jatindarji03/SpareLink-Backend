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
        expires:5000 // Expires in 45 sec
    }
});
const OTP = new mongoose.model('OTP',OTPSchema);
export default OTP;