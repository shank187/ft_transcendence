import { Request, Response } from 'express';
import { compare } from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';


import { create_session } from './session.service';

const prisma = new PrismaClient();

const refresh_cookie_name = 'refreshToken';

const refresh_cookie_options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: 7 * 24 * 60 * 60 * 1000,
};

function sign_access_token(user_id: string)
{
    return jwt.sign(
        { userId: user_id },
        process.env.JWT_SECRET as string,
        { expiresIn: '15m' }
    );
}

export const login = async (req: Request, res: Response) => {
    await body('email')
        .isEmail()
        .run(req);

    await body('password')
        .notEmpty()
        .run(req);

    const errors = validationResult(req);

    if (!errors.isEmpty())
        return res.status(400).json({
            error: 'Invalid email or password'
        });

    let { email, password } = req.body;

    email = email.trim().toLowerCase();



    

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user)
            return res.status(400).json({error: 'Invalid email or password'});

        const is_pass_valid = await compare(password, user.passwordHash);
        if (!is_pass_valid)
            return res.status(400).json({ error: 'Invalid email or password' });

        const access_token = sign_access_token(user.id);
        const { raw_token } = await create_session(user.id);

        res.cookie(refresh_cookie_name, raw_token, refresh_cookie_options);

        res.status(200).json({
            access_token,
            user: { id: user.id, username: user.username, email: user.email },
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};