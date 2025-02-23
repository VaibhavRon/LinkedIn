import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/auth_routes.js";
import userRoutes from "./routes/user_routes.js";
import cookieParser from "cookie-parser";
import postRoutes from "./routes/post_routes.js";
import notificationRoutes from "./routes/notification_routes.js";
import connectionRoutes from "./routes/connection_routes.js";
import cors from "cors";
const app=express();
app.use(express.json({limit:"50mb"}));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
dotenv.config();
app.use(cookieParser());
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}));
const PORT=process.env.PORT||5000

const dburl=process.env.MONGO_URI;
main().then((res)=>{
    console.log("connection sucessfull to database");
})
.catch((err)=>{
    console.log(err);
});
async function main()
    {
       await mongoose.connect(dburl);
    }


app.listen(PORT,(req,res)=>{
    console.log(`server is running on port ${PORT}`);
})

app.use("/api/v1/auth",authRoutes);
app.use("/api/v1/users",userRoutes);
app.use("/api/v1/posts",postRoutes);
app.use("/api/v1/notifications",notificationRoutes);
app.use("/api/v1/connections",connectionRoutes);
