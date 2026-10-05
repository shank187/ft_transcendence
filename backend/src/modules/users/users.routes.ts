import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { updateOnboarding , get_me, update_me, change_password, update_avatar} from './users.controller';
import { validate_profile } from "../../middleware/validate_profile";
import { upload_avatar } from "../../middleware/upload_avatar";

const router = Router();

router.patch('/onboarding', authenticate, updateOnboarding)
router.get('/me', authenticate, get_me);
router.post('/update_me',authenticate, validate_profile,update_me);
router.post('/change_password', authenticate ,change_password);
router.post("/me/avatar", authenticate, upload_avatar, update_avatar);

export default router;