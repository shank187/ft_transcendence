import { Request, Response } from 'express';
import { hash } from 'bcrypt';
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

export const register = async (req: Request, res: Response) => {


    await body('username')
        .isLength({ min: 3, max: 30 })
        .run(req);

    await body('email')
        .isEmail()
        .run(req);

    await body('password')
        .isStrongPassword({
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
        })
        .run(req);

    const errors = validationResult(req);

    if (!errors.isEmpty())
        return res.status(400).json({error: errors.array()[0].msg});

    let { username, email, password } = req.body;

    username = username.trim();
    email = email.trim().toLowerCase();



    try {
        const existing_user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { username }
                ]
            },
        });

        if (existing_user)
            return res.status(400).json({error: 'Username or Email already taken'});

        const hashed_pass = await hash(password, 10);

        const new_user = await prisma.user.create({
            data: {
                username,
                email,
                passwordHash: hashed_pass
            },
        });

        const access_token = sign_access_token(new_user.id);

        const { raw_token } = await create_session(new_user.id);

        res.cookie(
            refresh_cookie_name,
            raw_token,
            refresh_cookie_options
        );

        return res.status(201).json({
            access_token,
            user: {
                id: new_user.id,
                username: new_user.username,
                email: new_user.email,
            },
        });
    }
    catch (error)
    {
        return res.status(500).json({
            error: 'Internal server error'
        });
    }
};