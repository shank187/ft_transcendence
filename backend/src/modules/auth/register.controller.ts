import { Request, Response } from 'express';
import { hash } from 'bcrypt';
import { body, validationResult } from 'express-validator';
import { prisma } from '../../lib/prisma';
import { generate_verification_code } from './verification_code';
import { send_email } from "./email.service";


export const register = async (req: Request, res: Response) => {


    await body('username')
        .isLength({ min: 3, max: 30 })
        .withMessage('Username must be between 3 and 30 characters.')
        .run(req);

    await body('email')
        .isEmail()
        .withMessage('Please enter a valid email address.')
        .run(req);

    await body('password')
        .isStrongPassword({
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
        })
        .withMessage('Password must contain at least 8 characters, including uppercase, lowercase, a number and a symbol.')
        .run(req);

    const errors = validationResult(req);

    if (!errors.isEmpty())
        return res.status(400).json({ message: errors.array()[0].msg });

    let { username, email, password } = req.body;

    username = username.trim();
    email = email.trim().toLowerCase();
    
    if (username.length < 3 || username.length > 30)
        return res.status(400).json({ message: "Username must be between 3 and 30 characters." });

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
            return res.status(409).json({ message: 'Username or Email already taken' });
        
        const code = generate_verification_code();
        const passwordHash = await hash(password, 10);
        const codeHash = await hash(code, 10);

        const existing_pending = await prisma.pendingRegistration.findUnique({
            where: { email }
        });

        if (existing_pending)
        {
            await prisma.pendingRegistration.delete({
                where: { email }
            });
        }

        const pending = await prisma.pendingRegistration.create({
            data: {
                username,
                email,
                passwordHash,
                codeHash,
                expiresAt: new Date(Date.now() + 10 * 60 * 1000)
            }
        });


        try {
            await send_email(email, code);
        }
        catch {
            await prisma.pendingRegistration.deleteMany({
                where: {
                    id: pending.id
                }
            });

            if (existing_pending) {
                await prisma.pendingRegistration.create({
                    data: {
                        id: existing_pending.id,
                        username: existing_pending.username,
                        email: existing_pending.email,
                        passwordHash: existing_pending.passwordHash,
                        codeHash: existing_pending.codeHash,
                        expiresAt: existing_pending.expiresAt,
                        attempts: existing_pending.attempts,
                        createdAt: existing_pending.createdAt
                    }
                });
            }

            return res.status(503).json({ message: "Unable to send verification email. Please try again." });
        }

        return res.status(202).json({
            success: true,
            registrationId: pending.id,
            message: "Check your email for the verification code."
        });
    }
    catch {
        return res.status(500).json({ message: "Internal server error" });
    }
};
