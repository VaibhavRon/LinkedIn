import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    username:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    profilePicture:{
        type:String
    },
    bannerImg:{
        type:String
    },
    connections:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }],
    experience:[{
        title:String,
        company:String,
        startDate:Date,
        endDate:Date,
        description:String
    }],
    education:[{
        school:String,
        degree:String,
        startYear:Number,
        endYear:Number
    }],
    headline:{
       type:String,
       default:"LinkedIn user"
    },
    location:{
        type:String,
        default:"India"
    },
    about:{
        type:String,
        default:""
    },
    skills: [String],
})

const User = mongoose.model("User",userSchema);
export default User