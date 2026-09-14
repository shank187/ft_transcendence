import { Router } from 'express';

import { register } from './register.controller';
import { login } from './login.controller';
import { refresh, logout } from './auth.controller';
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


export default router;