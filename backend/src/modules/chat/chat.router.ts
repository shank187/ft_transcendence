import { Router } from "express";
import { getMessageHistory, getConversationsList } from "./chat.controller"
import { authenticate } from "../../middleware/authenticate";

const router = Router()

router.get("/:target/messages", authenticate, getMessageHistory)
router.get("/", authenticate, getConversationsList)
export default router;
