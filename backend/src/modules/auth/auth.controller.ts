import { Request, Response } from 'express';
import { hash, compare } from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../../app';

export const register = async (req: Request, res: Response) => {
    const { username, email, password } = req.body;
    try {
        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingUser = await prisma.user.findFirst({
            where: { OR: [{ email }, { username }] }
        });

        if (existingUser) {
            return res.status(400).json({ message: "Username or Email already taken" });
        }

        const hashed_pass = await hash(password, 10);
        const newUser = await prisma.user.create({
            data: { username, email, passwordHash: hashed_pass },
        });

        const accessToken = jwt.sign({ userId: newUser.id }, process.env.JWT_SECRET as string, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ userId: newUser.id }, process.env.JWT_REFRESH_SECRET as string, { expiresIn: '7d' });

        await prisma.user.update({
            where: { id: newUser.id },
            data: { refreshToken: refreshToken }
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(201).json({
            message: "User registered successfully",
            accessToken,
            user: { id: newUser.id, username: newUser.username, email: newUser.email }
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user)
            return res.status(400).json({ message: "Invalid email or password" });

        const is_pass_valid = await compare(password, user.passwordHash);
        if (!is_pass_valid)
            return res.status(400).json({ message: "Invalid email or password" });

        const a_token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, { expiresIn: '15m' });
        const r_token = jwt.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET as string, { expiresIn: '7d' });

        await prisma.user.update({
            where: { id: user.id },
            data: { refreshToken: r_token }
        });

        res.cookie('refresh_token', r_token,{
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({ message: "Login successful", accessToken: a_token, user: { id: user.id, username: user.username, email: user.email } });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};

export const refresh = async (req: Request, res: Response) => {
    const r_token = req.cookies.refresh_token;
    try {
        if (!r_token) return res.status(401).json({ message: "No refresh token provided" });

        let decoded;
        try {
            decoded = jwt.verify(r_token, process.env.JWT_REFRESH_SECRET as string) as { userId: string };
        } catch (error){
            return res.status(403).json({ message: "Invalid or expired refresh token" });
        }

        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
        if (!user || r_token !== user.refreshToken)
            return res.status(403).json({ message: "Refresh token does not match" });

        const new_a_token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, { expiresIn: '15m' });
        res.status(200).json({ message: "Token refreshed successfully", access_token: new_a_token });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};