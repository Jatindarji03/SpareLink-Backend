import mongoose, { Mongoose } from 'mongoose';

const QuotationSchema = new mongoose.Schema({
    mechanicId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    supplierId : {
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    product:{
        sparePartId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"SparePart",
        },
        quantity:{
            type:Number
        },
        perUnitPrice:{
            type:Number
        },
        discountPercentage:{
            type:Number
        },
        totalPrice:{
            type:Number
        },
    },
    status :{
        type:String,
        enum:['pending','approved','rejected','payment'],
        default:'pending'
    },
    deliveryDate:{
        type:String
    },
    paymentTerms:{
        type:String
    },
    additionalNotes:{
        type:String
    },
},{timestamps:true});
const Quotation = new mongoose.model('Quotation',QuotationSchema);
export default Quotation;