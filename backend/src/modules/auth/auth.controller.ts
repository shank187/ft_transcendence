import { Request, Response } from 'express';
import { hash, compare } from 'bcrypt';
import jwt from 'jsonwebtoken';
import {
    create_session,
    find_session_by_raw_token,
    revoke_session,
} from './session.service';
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

const refresh_cookie_name = 'refreshToken';

const refresh_cookie_options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: 7 * 24 * 60 * 60 * 1000,
};

function sign_access_token(user_id: string)
{
    return jwt.sign({ userId: user_id }, process.env.JWT_SECRET as string, { expiresIn: '15m' });
}

export const register = async (req: Request, res: Response) => {
    const { username, email, password } = req.body;
    try {
        const existing_user = await prisma.user.findFirst({
            where: { OR: [{ email }, { username }] },
        });

        if (existing_user)
            return res.status(400).json({ error: 'Username or Email already taken' });

        const hashed_pass = await hash(password, 10);
        const new_user = await prisma.user.create({
            data: { username, email, passwordHash: hashed_pass },
        });

        const access_token = sign_access_token(new_user.id);
        const { raw_token } = await create_session(new_user.id);

        res.cookie(refresh_cookie_name, raw_token, refresh_cookie_options);

        res.status(201).json({
            access_token,
            user: { id: new_user.id, username: new_user.username, email: new_user.email },
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
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

export const refresh = async (req: Request, res: Response) => {
    let raw_token: string | undefined;
    if (req.cookies)
        raw_token = req.cookies[refresh_cookie_name];
    else
        raw_token = undefined;

    try {
        if (!raw_token)
            return res.status(401).json({ error: 'No refresh token provided' });

        const session = await find_session_by_raw_token(raw_token);

        if (!session)
            return res.status(403).json({ error: 'Invalid refresh token' });

        if (session.revokedAt)
        {
            res.clearCookie(refresh_cookie_name, refresh_cookie_options);
            return res.status(403).json({error: 'Refresh token revoked'});
        }
        if (session.expiresAt < new Date())
        {
            await revoke_session(session.id);
            res.clearCookie(refresh_cookie_name, refresh_cookie_options);
            return res.status(403).json({ error: 'Refresh token expired' });
        }

        const access_token = sign_access_token(session.userId);

        res.status(200).json({ access_token });
    } catch (error)
    {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const logout = async (req: Request, res: Response) => {
    let raw_token: string | undefined;

    if (req.cookies)
        raw_token = req.cookies[refresh_cookie_name];
    else
        raw_token = undefined;



    try {
        if (raw_token)
        {
            const session = await find_session_by_raw_token(raw_token);
            if (session && !session.revokedAt)
                await revoke_session(session.id);
        }

        res.clearCookie(refresh_cookie_name, {
            httpOnly: true,// JavaScript in the browser cannot read this cookie.
            // Helps protect the refresh token from being stolen by frontend JS.
            //httpOnly = protect cookie from JavaScript


            secure: process.env.NODE_ENV === 'production',
            // In production, send this cookie only through HTTPS.
            // In development, allow HTTP such as localhost.


            sameSite: 'strict',
            // Browser sends this cookie only when requests come from your own site.
            // Helps protect against CSRF attacks.
        });

        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error)
    {
        res.status(500).json({ error: 'Internal server error' });
    }
};