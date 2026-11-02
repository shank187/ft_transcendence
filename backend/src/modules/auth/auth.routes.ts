import { Router } from 'express';

import { register } from './register.controller';
import { login } from './login.controller';
import { refresh, logout , check_session} from './auth.controller';
import { googleLogin, googleCallback} from './google.controller';
import { verify_registration } from './verify_registration.controller';
import { resend_verification } from './resend_verification.controller';



const router = Router();

router.post('/register', register);
router.post('/login', login);

router.get('/google', googleLogin);
router.get('/google/callback', googleCallback);

router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/session', check_session);


router.post('/verify-registration', verify_registration);
router.post('/resend-verification', resend_verification);

export default router;