import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name:{
            type:String,
            required:true,
            trim:true
        },
        email:{
            type:String,
            required:true,
            unique:true,
            trim:true,
            lowercase:true,
            match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
        },
        password:{
            type:String,
            required:true,
            trim:true,
        },
        roleId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Role",
            required:true
        },
        phoneNumber:{
            type:String,
            validate:{ 
                validator:function(v){
                    return !v || /\d{10}/.test(v); // Validate if provided, must be 10 digits
                },
                message:'Phone number must be 10 digits'
            }
        },
        address:{
           streetAddress:{
            type:String,
            trim:true
           },
           city:{
            type:String,
            trim:true
           },
           state:{
            type:String,
            trim:true,
           },
           pincode:{
            type:String,
            trim:true,
            validate:{
                validator:function(v){
                     return !v || /^\d{6}$/.test(v); // Validate if provided, must be 6 digits
                },
                message:'Pincode must be 6 digits'
            }
           }
        }
    },{timestamps:true}
);
userSchema.index({email:1});

const User=mongoose.model("User",userSchema);
export default User;