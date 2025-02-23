import Notification from "../models/notification.js";

export const getUserNotifications=async (req,res)=>{
    try{
        const notifications=await Notification.find({recipient:req.user._id})
        .populate("relatedUser","name username profilePicture")
        .populate("relatedPost","content postImage")
        .sort({createdAt:-1})

        res.json(notifications);
    }catch(err)
    {
        res.status(500).json({message:"Get user notifications error"});
    }
}

export const deleteNotification=async (req,res)=>{
    try{
        const notification=await Notification.findByIdAndDelete(req.params.id);
        res.json({message:"Notification deleted successfully"});
    }catch(err)
    {
        res.status(500).json({message:"Delete notification error"});
    }
}

export const markNotificationAsRead=async (req,res)=>{
    try{
        const notification=await Notification.findById(req.params.id);
        notification.read=true;
        await notification.save();
        res.json({message:"Notification marked as read"});
    }catch(err)
    {
        res.status(500).json({message:"Mark notification as read error"});
    }
}