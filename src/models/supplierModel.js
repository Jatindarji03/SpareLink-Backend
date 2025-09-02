import mongoose  from "mongoose";
const supplierSchema = new mongoose.Schema({
     userId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'User',
            required:true,
        },
        storeName:{
            type:String,
        },
        status:{
            type:String,
            enum:['pending','approved','rejected'],
        },
        address: {
        street: {
            type: String,
            trim: true
        },
        city: {
            type: String,
            trim: true
        },
        state: {
            type: String,
            trim: true,
        },
        country: {
            type: String,
            trim: true
        },
        pincode: {
            type: String,
            trim: true,
            validate: {
                validator: function (v) {
                    return !v || /^\d{6}$/.test(v); // Validate if provided, must be 6 digits
                },
                message: 'Pincode must be 6 digits'
            }
        }
    }
},{timestamps:true});

const Supplier = mongoose.model("Supplier",supplierSchema);
export default Supplier;