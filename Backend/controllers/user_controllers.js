import User from "../models/user.js"
import cloudinary from "../lib/cloudinary.js";
export const getSuggestedConnections=async (req,res)=>{
    try{
        const CurrentUser=await User.findById(req.user._id).select("connections");
        const suggestedConnections=await User.find({ _id: { $nin: CurrentUser.connections,$ne:
         req.user._id
         } }).select("name username profilePicture headline")
         .limit(5);;

         res.json(suggestedConnections);
    }catch(err)
    {
        res.status(500).json({message:"Suggested connections error"});
    }
}

export const getPublicProfile=async (req,res)=>{
    try{
        const user=await User.findOne({username:req.params.username}).select("-password");
        if (!user) {
			return res.status(404).json({ message: "User not found" });
		}
        res.json(user);
    }catch(err)
    {
        res.status(500).json({message:"User profile error"});
    }
}

export const updateUserProfile=async (req,res)=>{

    try{
        const allowedFields = [
			"name",
			"username",
			"headline",
			"about",
			"location",
			"profilePicture",
			"bannerImg",
			"skills",
			"experience",
			"education",
		];

        const updatedFields = {};

        allowedFields.forEach((field) => {
            if (req.body[field]) {
                updatedFields[field] = req.body[field];
            }
        });

        if(req.body.profilePicture)
        {
            const result = await cloudinary.uploader.upload(req.body.profilePicture);
            updatedFields.profilePicture = result.secure_url;
        }

        if(req.body.bannerImg)
        {
            const result1 = await cloudinary.uploader.upload(req.body.bannerImg);
            updatedFields.bannerImg = result1.secure_url;
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { $set: updatedFields },
            { new: true }
        );

        res.json(updatedUser);
    }catch(err)
    {
        res.status(500).json({message:"User profile error"});
    }
}