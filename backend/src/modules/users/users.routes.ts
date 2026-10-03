import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { updateOnboarding , get_me, update_me, change_password} from './users.controller';
import { validate_profile } from "../../middleware/validate_profile";

const router = Router();

router.patch('/onboarding', authenticate, updateOnboarding)
router.get('/me', authenticate, get_me);
router.post('/update_me',authenticate, validate_profile,update_me);
router.post('/change_password', authenticate ,change_password);

export default router;