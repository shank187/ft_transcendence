import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import { sendFriendRequest, acceptFriendRequest, rejectFriendRequest  } from "./friendRequest.controller"
import { deleteFriendship, return_uses_id } from "./friendship.controller"
import { blockUser, unblockUser } from "./block.controller"
import { getFriends, getPendingRequests, getBlockedUsers} from "./friends.controller"
import { getMessageHestory } from "../chat/chat.controller"
const router = Router()

router.post("/:userId/request", authenticate, sendFriendRequest)
router.post("/:userId/accept", authenticate, acceptFriendRequest)
router.post("/:userId/reject", authenticate, rejectFriendRequest)
router.delete("/:userId/delete", authenticate, deleteFriendship)
router.post("/:userId/block", authenticate, blockUser)
router.post("/:userId/unblock", authenticate, unblockUser)
router.get("/", authenticate, getFriends)
router.get("/conversations/:userId/messages", authenticate, getMessageHestory)


router.get("/usersIds", authenticate, return_uses_id)
export default router;