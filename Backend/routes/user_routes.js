import express from "express";
import ProtectRoute from "../middlewares/protectRoute.js";
import { getSuggestedConnections ,getPublicProfile,updateUserProfile} from "../controllers/user_controllers.js";
const router=express.Router();

router.get("/suggestions",ProtectRoute,getSuggestedConnections);
router.get("/:username",ProtectRoute,getPublicProfile);
router.put("/profile",ProtectRoute,updateUserProfile);

export default router;