import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import { sendFriendRequest, cancelFriendRequest, acceptFriendRequest, rejectFriendRequest  } from "./friendRequest.controller"
import { deleteFriendship } from "./friendship.controller"
import { blockUser, unblockUser } from "./block.controller"
import { getFriends, canMessageUser,  getPendingRequests} from "./friends.controller"
const router = Router()

router.post("/:userId/request", authenticate, sendFriendRequest)
router.delete("/:userId/cancel_request", authenticate, cancelFriendRequest)
router.post("/:userId/accept", authenticate, acceptFriendRequest)
router.post("/:userId/reject", authenticate, rejectFriendRequest)
router.delete("/:userId/delete", authenticate, deleteFriendship)
router.post("/:userId/block", authenticate, blockUser)
router.post("/:userId/unblock", authenticate, unblockUser)
router.get("/", authenticate, getFriends)
router.get("/:userId/can-message", authenticate, canMessageUser)
router.get("/pending_request", authenticate, getPendingRequests)

export default router;