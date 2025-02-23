import express from "express";
import {signup,login,logout,getCurrentUser} from "../controllers/auth_controllers.js";
import protectRoute from "../middlewares/protectRoute.js";

const router=express.Router();


router.post("/signup",signup);
router.post("/login",login);
router.post("/logout",logout);
router.get("/me",protectRoute,getCurrentUser);

export default router