import express from "express";
import {deleteNotification,markNotificationAsRead,getUserNotifications} from "../controllers/notification_controllers.js";
import ProtectRoute from "../middlewares/protectRoute.js";
const router=express.Router();

router.get("/",ProtectRoute,getUserNotifications);
router.post("/:id",ProtectRoute,markNotificationAsRead);
router.delete("/:id",ProtectRoute,deleteNotification);

export default router