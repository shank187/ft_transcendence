import { Request, Response } from 'express';
import { compare } from 'bcrypt';

import { prisma } from '../../lib/prisma';
import { refreshCookieName, refreshCookieOptions } from './cookie.config';
import { sign_access_token } from './token.service';
import { create_session } from './session.service';

export const verify_registration = async (req: Request, res: Response) => {
    const { registrationId, code } = req.body;

    if (typeof registrationId !== 'string' || !registrationId.trim()) {
        return res.status(400).json({
            success: false,
            error: 'Registration ID is required.',
        });
    }

    if (typeof code !== 'string' || code.length !== 6) {
        return res.status(400).json({success: false, error: 'Code must contain 6 digits.'});
    }

    for (let i = 0; i < code.length; i++)
    {
        if (code[i] < '0' || code[i] > '9')
            return res.status(400).json({success: false, error: 'Code must contain only digits.'});
    }

    try {
        const pending = await prisma.pendingRegistration.findUnique({
            where: { id: registrationId },
        });

        if (!pending)
            return res.status(400).json({success: false, error: 'Registration not found. Please register again.'});


        if (pending.attempts >= 5)
            return res.status(429).json({success: false, error: 'Too many attempts. Please register again.'});

        if (pending.expiresAt.getTime() <= Date.now()) {
            return res.status(400).json({
                success: false,
                error: 'Code expired. Please register again.',
            });
        }

        const attempt = await prisma.pendingRegistration.updateMany({
            where: {id: pending.id},
            data: { attempts: pending.attempts + 1 }
        });

        if (attempt.count === 0)// prisma add count  by default in apdate many    
            return res.status(400).json({ success: false, error: 'Verification unavailable. Please register again.'});

        const valid_code = await compare(code, pending.codeHash);

        if (!valid_code)
            return res.status(400).json({success: false, error: 'Invalid verification code.'});

        const user = await prisma.user.create({
            data: {
                username: pending.username,
                email: pending.email,
                passwordHash: pending.passwordHash,
            },
            select: {
                id: true,
                username: true,
                email: true,
                displayName: true,
                avatarUrl: true,
                onboardingCompletedAt: true
            }
        });

        await prisma.pendingRegistration.deleteMany({
            where: { id: pending.id }
        });

        const access_token = sign_access_token(user.id);
        const { raw_token } = await create_session(user.id);

        res.cookie(refreshCookieName, raw_token, refreshCookieOptions);

        return res.status(201).json({
            success: true,
            access_token,
            user
        });
    } catch (error) {
        if (error instanceof Error && 'code' in error && error.code === 'P2002') {
            return res.status(409).json({
                success: false,
                error: 'Username or email already taken. Try logging in.',
            });
        }

        return res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
};