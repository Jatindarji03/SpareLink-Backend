import mongoose from "mongoose";
const mechanicSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    workShop: {
        type: String
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
}, { timestamps: true });
const Mechanic = mongoose.model('Mechanic', mechanicSchema);
export default Mechanic;