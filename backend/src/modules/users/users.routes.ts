import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { updateOnboarding , get_me} from './users.controller';

const router = Router();

router.patch('/onboarding', authenticate, updateOnboarding)
router.get('/me', authenticate, get_me);

export default router;