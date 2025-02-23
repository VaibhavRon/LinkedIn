import Post from "../models/post.js";
import Notification from "../models/notification.js";
import { sendCommentNotificationEmail } from "../mailtrap/emailHandlers.js";
import cloudinary from "../lib/cloudinary.js";
export const getRelatedPosts=async (req,res)=>{
    try{
        const posts=await Post.find({author:{$in:[...req.user.connections, req.user._id]}})
        .populate("author","name username profilePicture headline")
        .populate("comments.user","name  profilePicture ")
        .sort({createdAt:-1})

        res.json(posts);
    }
    catch(err)
    {
        res.status(500).json({message:"Related posts error"});
    }
}

export const createPost=async (req,res)=>{
    try{
        const{content,image}=req.body;
        let newpost;
        if(image)
        {
            const imageres=await cloudinary.uploader.upload(image);
            newpost=new Post({
            author:req.user._id,content,
            image:imageres.secure_url
        });
        }
        else{
            newpost=new Post({
            author:req.user._id,content
        });
        }
        await newpost.save();
        res.json(newpost);

    }catch(err)
    {
        res.status(500).json({message:"Create post error"});
    }
}

export const deletePost=async (req,res)=>{
    try{

        const postId=req.params.id;
        const userId=req.user._id;

        const post=await Post.findById(postId);
        if(!post)
        {   
            return res.status(404).json({message:"Post not found"});
        }
        if(post.author.toString()!==userId.toString())
        {
            return res.status(401).json({message:"Unauthorized"});
        }
        if(post.image)
        {
            await cloudinary.uploader.destroy(post.image.split("/").pop().split(".")[0]);
        }

        await post.deleteOne(); 
        res.json({message:"Post deleted successfully"});

    }catch(err)
    {
        res.status(500).json({message:"Delete post error"});
    }
}

export const getPost=async (req,res)=>{
    try{
        const postId=req.params.id;
        const post=await Post.findById(postId);
        if(!post)
        {
            return res.status(404).json({message:"Post not found"});
        }
        res.json(post);
    }catch(err)
    {
        res.status(500).json({message:"Get post error"});
    }    
}

export const createComment=async (req,res)=>{
    try{
        const postId=req.params.id;
        const{content}=req.body;
        const post=await Post.findByIdAndUpdate(postId,{$push:{comments:{user:req.user._id,content}}},{new:true})
        .populate("author","name username profilePicture headline")
        .populate("comments.user","name  profilePicture ");
        

        if(post.author._id.toString()!==req.user._id.toString())
        {
            const notification=new Notification({
                recipient:post.author,
                type:"comment",
                relatedUser:req.user._id,
                relatedPost:post._id
            });
            await notification.save();

            try {
				const postUrl = process.env.CLIENT_URL + "/post/" + postId;
				await sendCommentNotificationEmail(
					post.author.email,
					post.author.name,
					req.user.name,
					postUrl,
					content
				);
			} catch (error) {
				console.log("Error in sending comment notification email:", error);
			}
        }

        res.json(post);
    }catch(err)
    {
        res.status(500).json({message:"Create comment error"});
    }
}

export const createLike=async(req,res)=>{
    try{
        const postId=req.params.id;
        const userId=req.user._id;

        const post=await Post.findById(postId);
        if(!post)
        {
            return res.status(404).json({message:"Post not found"});
        }
        if(post.likes.includes(userId))
        {
            post.likes=post.likes.filter((id)=>id.toString()!==userId.toString());
        }
        else
        {
            post.likes.push(userId);

            if (post.author.toString() !== userId.toString()) {
				const newNotification = new Notification({
					recipient: post.author,
					type: "like",
					relatedUser: userId,
					relatedPost: postId,
				});

				await newNotification.save();
			}
        }
        await post.save();
        res.json(post);

    }catch{

        res.status(500).json({message:"Create like error"});
    }
}


export const deleteComment=async(req,res)=>{
    try{
        const postId=req.params.id;
        const commentId=req.params.commentId;
        const post=await Post.findById(postId);
        if(!post)
        {
            return res.status(404).json({message:"Post not found"});
        }
        post.comments=post.comments.filter((comment)=>comment._id.toString()!==commentId.toString());
        await post.save();
        res.json(post);
    }catch(err)
    {
        res.status(500).json({message:"Delete comment error"});
    }
}
