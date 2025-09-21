import mongoose from "mongoose";
const OrderSchema = new mongoose.Schema(
    {
        personalDetails: {
            name: String,
            phoneNumber: String,
            email: String
        },
        address: {
            streetAddress: String,
            city: String,
            pincode: Number,
            state: String
        },
        mechanicId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        supplierId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        quotationId: {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Quotation",
            required:true
        }
    }, { timestamps: true }
);

const Order = new mongoose.model('Order',OrderSchema);
export default Order;