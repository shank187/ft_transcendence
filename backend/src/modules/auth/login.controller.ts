import { Request, Response } from 'express';
import { compare } from 'bcrypt';

import { body, validationResult } from 'express-validator';

import {refreshCookieName,refreshCookieOptions} from './cookie.config';
import { sign_access_token } from './token.service';

import { create_session } from './session.service';

import { prisma } from '../../lib/prisma';





export const login = async (req: Request, res: Response) => {
    await body('email')
        .isEmail()
        .run(req);

    await body('password')
        .notEmpty()
        .run(req);

    const errors = validationResult(req);

    if (!errors.isEmpty())
        return res.status(200).json({
            success: false,
            error: 'Invalid email or password'
         });
    let { email, password } = req.body;

    email = email.trim().toLowerCase();



    

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.passwordHash)
            return res.status(200).json({
                success: false,
                error: 'Invalid email or password'
            });

        const is_pass_valid = await compare(password, user.passwordHash);
        if (!is_pass_valid)
            return res.status(200).json({
                success: false,
                error: 'Invalid email or password'
            });

        const access_token = sign_access_token(user.id);
        const { raw_token } = await create_session(user.id);

        res.cookie(refreshCookieName, raw_token, refreshCookieOptions);

        res.status(200).json({
            success: true,
            access_token,
            user: { id: user.id, username: user.username, email: user.email , onboardingCompleted: user.onboardingCompletedAt},
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};