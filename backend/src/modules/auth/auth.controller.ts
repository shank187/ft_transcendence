import { Request, Response } from 'express';
import { hash, compare } from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';





export const prisma = new PrismaClient();


const REFRESH_COOKIE_NAME = 'refreshToken';

const refreshCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: 7 * 24 * 60 * 60 * 1000,
};


export const register = async (req: Request, res: Response) => {
    const { username, email, password } = req.body;
    try {
        const existingUser = await prisma.user.findFirst({
            where: { OR: [{ email },{ username }] },
        });

        if (existingUser) {
            return res.status(400).json({ error: 'Username or Email already taken'});
        }

        const hashed_pass = await hash(password, 10);
        const newUser = await prisma.user.create({
            data: { username, email, passwordHash: hashed_pass },
        });

        const accessToken = jwt.sign({ userId: newUser.id }, process.env.JWT_SECRET as string, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ userId: newUser.id }, process.env.JWT_REFRESH_SECRET as string, { expiresIn: '7d' });

        await prisma.user.update({
            where: { id: newUser.id },
            data: { refreshToken },
        });

        res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions);

        res.status(201).json({
            accessToken,
            user: { id: newUser.id, username: newUser.username, email: newUser.email },
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
            return res.status(400).json({ error: 'Invalid email or password' });

        const is_pass_valid = await compare(password, user.passwordHash);
        if (!is_pass_valid)
            return res.status(400).json({ error: 'Invalid email or password' });

        const accessToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET as string, { expiresIn: '7d' });

        await prisma.user.update({
            where: { id: user.id },
            data: { refreshToken },
        });

        res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions);

        res.status(200).json({
            accessToken,
            user: { id: user.id, username: user.username, email: user.email },
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const refresh = async (req: Request, res: Response) => {
    const token = req.cookies?.[REFRESH_COOKIE_NAME];
    try {
        if (!token)
            return res.status(401).json({ error: 'No refresh token provided' });

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET as string) as { userId: string };
        } catch {
            return res.status(403).json({ error: 'Invalid or expired refresh token' });
        }

        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
        if (!user || token !== user.refreshToken)
            return res.status(403).json({ error: 'Refresh token does not match' });

        const accessToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, { expiresIn: '15m' });
        res.status(200).json({ accessToken });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const logout = async (req: Request, res: Response) => {
    const token = req.cookies?.[REFRESH_COOKIE_NAME];
    try {
        if (token)
        {
            await prisma.user.updateMany({
                where: { refreshToken: token },
                data: { refreshToken: null },
            });
        }

        res.clearCookie(REFRESH_COOKIE_NAME, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        });

        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};