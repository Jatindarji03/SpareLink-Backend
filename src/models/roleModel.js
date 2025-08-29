import mongoose from "mongoose";
const RoleSchema = new mongoose.Schema(
    {
        roleName:{
            type:String,
            required:true,
            unique:true
        },
        permissions:[{
            resources:String,
            actions:[String]
        }]
    },{timestamps:true}
);
const Role=mongoose.model("Role",RoleSchema);
export default Role;
