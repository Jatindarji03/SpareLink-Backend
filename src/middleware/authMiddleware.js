import jwt from 'jsonwebtoken';
import Role from '../models/roleModel.js';

const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        throw new Error("Invalid token");
    }
}

const authMiddleware =async (req,res,next)=>{
    const token = req.cookies.authtoken || req.headers.authorization?.split(" ")[1];
    if(!token){
        return res.status(401).json({message:"Unauthorized: No token provided"});
    }
    try{
        const user=verifyToken(token);
        req.user=user;
        if(req.user.roleId){
            let roleName=await Role.findById(req.user.roleId).select('roleName');
            req.user.roleName=roleName.roleName;
        }
        // console.log("Authenticated User:", req.user); // Debugging line
        next();
    }catch(error){
        console.log("Authentication Error:", error.message); // Debugging line
        return res.status(401).json({message:"Unauthorized: Invalid token"});
    }
}

export default authMiddleware;