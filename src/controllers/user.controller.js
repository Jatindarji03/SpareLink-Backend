import Role from "../models/roleModel.js";
import User from "../models/userModel.js";
import Mechanic from "../models/mechanicModel.js";
import SupplierRequest from "../models/supplierRequestModel.js";
import bcrypt from 'bcrypt'
const createUser = async (req,res)=>{
    try{
        const{name,email,password,role}=req.body;
        //Check if all fields are present
        if(!name || !email || !password || !role){
            return res.status(400).json({message:"All fields are required"});
        }
        //check if user already exists
        const existingUser = await User.findOne({email});
        const roleData=await Role.findOne({roleName:role});

        if(existingUser){
            return res.status(409).json({message:"User already exists"});
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        //create a new user
        const newUser = new User({
            name,
            email,
            password:hashedPassword,
            roleId:roleData._id
        });
        await newUser.save();
        /*If the role is mechanic, create a mechanic profile in the mechanic
         collection we can add the shop name and phone number later*/
        if(role==='mechanic'){
            const newMechanic = new Mechanic({
                userId:newUser._id
            });
            await newMechanic.save();
        }else if(role==='supplier'){
            /* if the role is supplier move the data to request supplier collection
               if the admin approves the request then move the data to supplier collection
            */
           const newSupplierRequest = new SupplierRequest({
                userId:newUser._id
            });
            await newSupplierRequest.save();
        }
        return res.status(201).json({message:"User created successfully", user:newUser});

    }catch(error){
        console.error("Error creating user:", error);
        return res.status(500).json({message:"Internal server error"});
    }
};

export {createUser};