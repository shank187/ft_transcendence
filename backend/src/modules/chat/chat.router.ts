import { Router } from "express";
import { getMessageHistory } from "./chat.controller"
import { authenticate } from "../../middleware/authenticate";

const router = Router()

router.get("/:target/messages", authenticate, getMessageHistory)
export default router;
