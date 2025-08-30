import jwt from 'jsonwebtoken';

const verifyToken = () => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        throw new Error("Invalid token");
    }
}

const authMiddleware =(req,res,next)=>{
    const token = req.cookies.authtoken || req.headers.authorization?.split(" ")[1];
    if(!token){
        return res.status(401).json({message:"Unauthorized: No token provided"});
    }
    try{
        const user=verifyToken(token);
        req.user=user;
        next();
    }catch(error){
        return res.status(401).json({message:"Unauthorized: Invalid token"});
    }
}

export default authMiddleware;