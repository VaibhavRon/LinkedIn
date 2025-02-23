import jwt from "jsonwebtoken";
import User from "../models/user.js";

 const ProtectRoute = async (req, res, next) =>{
    try{
        const token=req.cookies["token"];
        if(!token)
        {
            return res.status(401).json({message:"Unauthorized"});
        }
        const decodedToken=jwt.verify(token,process.env.JWT_SECRET);
        if(!decodedToken)
        {
            return res.status(401).json({message:"Unauthorized"});
        }
        const user=await User.findById(decodedToken.userId);
        if(!user)
        {
            return res.status(401).json({message:"Unauthorized"});
        }
        req.user=user;
        next();
    }catch(err)
    {
        console.log("Error in protect route middleware",err);
        res.status(500).json({message:"Server error"});
    }
    
}

export default ProtectRoute;