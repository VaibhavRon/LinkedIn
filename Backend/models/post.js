import mongoose from "mongoose";

const postSchema=new mongoose.Schema({
    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    content:{
        type:String,
    },
    comments:[{
        user:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        content:String,
        createdAt:{
            type:Date,
            default:Date.now
        }
    }],
    likes:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }],
    image:{
        type:String
    }
},{ timestamps: true })

const Post=mongoose.model("Post",postSchema);
export default Post