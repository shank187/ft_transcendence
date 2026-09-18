import { Router } from 'express';

import { register } from './register.controller';
import { login } from './login.controller';
import { refresh, logout , check_session} from './auth.controller';
import {
    googleLogin,
    googleCallback
} from './google.controller';

const router = Router();

router.post('/register', register);
router.post('/login', login);

router.get('/google', googleLogin);
router.get('/google/callback', googleCallback);

router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/session', check_session);


export default router;