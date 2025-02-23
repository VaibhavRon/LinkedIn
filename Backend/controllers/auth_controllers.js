import User from "../models/user.js";
import { generateTokenAndSetCookies } from "../utils/generateAndSetCookie.js";
import dotenv from "dotenv"
dotenv.config();
import bcryptjs from "bcryptjs";
import { sendWelcomeEmail } from "../mailtrap/emailHandlers.js";
import jwt from "jsonwebtoken";

export const signup=async (req,res)=>{
    const{name,username,password,email}=req.body;
    try{
        if(!name || !username || !password || !email){
            return res.status(400).json({message:"All fields are required"});
        }
        if(password.length<6){
            return res.status(400).json({message:"Password must be at least 6 characters"});
        }
        const user1=await User.findOne({email})
        if(user1)
        {
            return res.status(400).json({message:"User with this email exists"});
        }
        const user=await User.findOne({username})
        if(user)
        {
            return res.status(400).json({message:"User with this username exists"});
        }
        const hashedPassword=await bcryptjs.hash(password,10);
        const newUser=new User({
            name,
            username,
            password:hashedPassword,
            email});
        await newUser.save();

        generateTokenAndSetCookies(res,newUser._id);
        console.log("token")

        res.status(201).json({message:"User created successfully"});

        const profileURL=process.env.CLIENT_URL+"/profile/"+newUser.username;

        try{
            await sendWelcomeEmail(newUser.email,newUser.name,profileURL);
        }
        catch(err){
            console.log("Error in sending welcome email ");
        }
    }
    catch(err){
        res.status(400).json({message:"Error"});
    }
}
export const login=async (req,res)=>{
    try {
		const { username, password } = req.body;
        console.log("login controller")
        console.log(username,password)
		const user = await User.findOne({ username });
		if (!user) {
			return res.status(400).json({ message: "Invalid credentials" });
		}
		const isMatch = await bcryptjs.compare(password, user.password);
		if (!isMatch) {
			return res.status(400).json({ message: "Invalid credentials" });
		}

		const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "3d" });
		await res.cookie("token", token, {
			httpOnly: true,
			maxAge: 3 * 24 * 60 * 60 * 1000,
			sameSite: "strict",
			secure: process.env.NODE_ENV === "production",
		});
        console.log("token generatef")
		res.json({ message: "Logged in successfully" });
	} catch (error) {
		console.error("Error in login controller:", error);
		res.status(500).json({ message: "Server error" });
	}
}
export const logout=(req,res)=>{
    res.clearCookie("token");
    res.status(200).json({message:"Logout successful"});
}

export const getCurrentUser=(req,res)=>{
    try{
        res.json(req.user);
    }catch(err)
    {
        res.status(500).json({message:"Server error"});
    }
}