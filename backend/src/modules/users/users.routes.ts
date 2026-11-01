import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { updateOnboarding , get_me, update_me, change_password, update_avatar, delete_avatar} from './users.controller';
import { validate_profile } from "../../middleware/validate_profile";
import { upload_avatar } from "../../middleware/upload_avatar";
import { getUserFriends } from "../friends/friends.controller"
import {updateCurrentGym} from "../gym/gyms.controller"
import {getCurrentGym} from "../gym/gyms.controller"


const router = Router();

router.patch('/onboarding', authenticate, updateOnboarding)
router.get('/me', authenticate, get_me);
router.post('/update_me',authenticate, validate_profile,update_me);
router.post('/change_password', authenticate ,change_password);
router.post("/me/avatar", authenticate, upload_avatar, update_avatar);
router.delete("/me/avatar/delete", authenticate, delete_avatar);
router.get('/:userId/friends', authenticate, getUserFriends);


router.post('/current-gym',authenticate, updateCurrentGym);
router.get('/current-gym', authenticate, getCurrentGym);

export default router;