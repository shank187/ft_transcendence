import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { updateOnboarding , get_me,update_me,upload_avatar} from './users.controller';

import {
    uploadAvatarFile,
} from "../../middleware/uploadAvatar";

const router = Router();

router.patch('/onboarding', authenticate, updateOnboarding)
router.get('/me', authenticate, get_me);
router.patch('/me',authenticate,update_me);
router.post("/me/avatar", authenticate, uploadAvatarFile.single("avatar"), upload_avatar);

export default router;