import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { updateOnboarding , get_me} from './users.controller';
import { getUserFriends } from "../friends/friends.controller"
const router = Router();

router.patch('/onboarding', authenticate, updateOnboarding)
router.get('/me', authenticate, get_me);
router.get('/:userId/friends', authenticate, getUserFriends);

export default router;