import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import { sendFriendRequest } from "./friends.controller"

const router = Router()

router.post("/:userId/request", authenticate, sendFriendRequest)
export default router;