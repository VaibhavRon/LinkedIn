import ConnectionRequest from "../models/connection.js";
import User from "../models/user.js";
import Notification from "../models/notification.js";
import dotenv from "dotenv";
dotenv.config();
import {connectionAcceptedEmail} from "../mailtrap/emailHandlers.js";

export const getConnectionRequests=async (req,res)=>{
    try{
        const connectionRequests=await ConnectionRequest.find({recipient:req.user._id,status:"pending"})
        .populate("sender","name username profilePicture")
        .sort({createdAt:-1})

        res.json(connectionRequests);
    }catch(err)
    {
        res.status(500).json({message:"Get connection requests error"});
    }
}

export const createConnectionRequest=async (req,res)=>{
    try{
        const {userId}=req.params;
        const sender=req.user._id;

        console.log("connection req ssent");
        if (sender.toString() === userId) {
			return res.status(400).json({ message: "You can't send a request to yourself" });
		}

		if (req.user.connections.includes(userId)) {
			return res.status(400).json({ message: "You are already connected" });
		}

        const existingRequest = await ConnectionRequest.findOne({
			sender: sender,
			recipient: userId,
			status: "pending",
		});

        if (existingRequest) {  
            return res.status(400).json({ message: "A connection request already exists" });
        }

        const connectionRequest=new ConnectionRequest({sender,recipient:userId});

        await connectionRequest.save();
        res.json({message:"Connection request sent successfully"});
    }catch(err)
    {
        res.status(500).json({message:"Create connection request error"});
    }
}

export const acceptConnectionRequest=async(req,res)=>{
    try{

        const {requestId}=req.params;
        const connectionRequest = await ConnectionRequest.findById(requestId)
        .populate("sender", "name email username")
		.populate("recipient", "name username");

        console.log("inside accepted connection")
        if(!connectionRequest)
        {
            return res.status(404).json({message:"Connection request not found"});
        }
        if(connectionRequest.recipient._id.toString()!==req.user._id.toString())        {
            return res.status(401).json({message:"Unauthorized"});
        }
        if (connectionRequest.status !== "pending") {
			return res.status(400).json({ message: "This request has already been processed" });
		}
        connectionRequest.status="accepted";
        await connectionRequest.save();

        await User.findByIdAndUpdate(connectionRequest.sender, { $addToSet: { connections: req.user._id } });
		await User.findByIdAndUpdate(req.user._id, { $addToSet: { connections: connectionRequest.sender } });

        const notification = new Notification({
			recipient: connectionRequest.sender._id,
			type: "connectionAccepted",
			relatedUser: req.user._id,
		});

		await notification.save();

		res.json({ message: "Connection accepted successfully" });

		const senderEmail =connectionRequest.sender.email;
		const senderName = connectionRequest.sender.name;
		const recipientName = connectionRequest.recipient.name;
		const profileUrl = process.env.CLIENT_URL + "/profile/" +connectionRequest.recipient.username;

		try {
		 await connectionAcceptedEmail(senderEmail, senderName, recipientName, profileUrl);
		} catch (error) {
			console.error("Error in sendConnectionAcceptedEmail:", error);
		}

    }catch(err)
    {
        res.status(500).json({message:"Accept connection request error"});
    }
}

export const rejectConnectionRequest=async(req,res)=>{
    try{
        const {requestId}=req.params;
        const connectionRequest=await ConnectionRequest.findById(requestId);
        if(!connectionRequest)
        {
            return res.status(404).json({message:"Connection request not found"});
        }
        if(connectionRequest.recipient.toString()!==req.user._id.toString())
        {
            return res.status(401).json({message:"Unauthorized"});
        }
        if (connectionRequest.status !== "pending") {
            return res.status(400).json({ message: "This request has already been processed" });
        }
        connectionRequest.status="rejected";
        await connectionRequest.save();
        res.json({message:"Connection request rejected successfully"});
    }catch(err)
    {    
        res.status(500).json({message:"Reject connection request error"});
    }
}

export const getUserConnections=async (req,res)=>{
    try{
        const connections=await User.findById(req.user._id).populate("connections","name username headline profilePicture");
        res.json(connections.connections);
    }catch(err)
    {
        res.status(500).json({message:"Get connections error"});
    }
}

export const deleteConnection=async (req,res)=>{
    try{
        const {userId}=req.params;
        if(req.user._id.toString()===userId.toString())
        {
            return res.status(400).json({message:"You can't delete yourself"});
        }
        await User.findByIdAndUpdate(req.user._id, { $pull: { connections: userId } });
        await User.findByIdAndUpdate(userId, { $pull: { connections: req.user._id } });
        res.json({message:"Connection deleted successfully"});
    }catch(err)
    {
        res.status(500).json({message:"Delete connection error"});
    }
}

export const getConnectionStatus = async (req, res) => {
	try {
		const targetUserId = req.params.userId;
		const currentUserId = req.user._id;

		const currentUser = req.user;
		if (currentUser.connections.includes(targetUserId)) {
			return res.json({ status: "connected" });
		}

		const pendingRequest = await ConnectionRequest.findOne({
			$or: [
				{ sender: currentUserId, recipient: targetUserId },
				{ sender: targetUserId, recipient: currentUserId },
			],
			status: "pending",
		});

		if (pendingRequest) {
			if (pendingRequest.sender.toString() === currentUserId.toString()) {
				return res.json({ status: "pending" });
			} else {
				return res.json({ status: "received", requestId: pendingRequest._id });
			}
		}

		// if no connection or pending req found
		res.json({ status: "not_connected" });
	} catch (error) {
		console.error("Error in getConnectionStatus controller:", error);
		res.status(500).json({ message: "Server error" });
	}
};