import express from "express";
import {createConnectionRequest,acceptConnectionRequest,rejectConnectionRequest,getConnectionRequests,getUserConnections,deleteConnection,getConnectionStatus} from "../controllers/connection_controllers.js";
import protectRoute from "../middlewares/protectRoute.js";
const router=express.Router();

router.post("/request/:userId",protectRoute,createConnectionRequest);
router.put("/accept/:requestId",protectRoute,acceptConnectionRequest);
router.put("/reject/:requestId",protectRoute,rejectConnectionRequest);

router.get("/requests",protectRoute,getConnectionRequests);

router.get("/",protectRoute,getUserConnections);
router.delete("/:userId",protectRoute,deleteConnection);
router.get("/status/:userId", protectRoute, getConnectionStatus);

export default router