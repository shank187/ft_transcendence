import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { updateOnboarding } from './users.controller';

const router = Router();

router.patch('/onboarding', authenticate, updateOnboarding);

export default router;