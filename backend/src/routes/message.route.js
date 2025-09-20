import express from "express"
import { protectRoute } from "../middleware/auth.middleware.js";
import {getUsersForSidebar , getMessages,sendMessage} from "../controllers/message.controller.js"

const router = express.Router();

// used to fetch users for left side bar which will show all users with whom u can chat
router.get("/users",protectRoute,getUsersForSidebar)
// for interaction between two users
router.get("/:id",protectRoute,getMessages)

router.post("/send/:id", protectRoute,sendMessage)
export default router;