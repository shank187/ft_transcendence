import { Request, Response } from 'express';
import { hash } from 'bcrypt';
import { body, validationResult } from 'express-validator';

import {refreshCookieName,refreshCookieOptions} from './cookie.config';
import { sign_access_token } from './token.service';

import { create_session } from './session.service';

import { prisma } from '../../lib/prisma';

import { error } from 'console';
import { randomInt } from 'crypto';
import { send_email } from "./email.service";


export const register = async (req: Request, res: Response) => {


    await body('username')
        .isLength({ min: 3, max: 30 })
        .run(req);

    await body('email')
        .isEmail()//create the rule
        .run(req);//Execute this validator on the current request.

    await body('password')
        .isStrongPassword({
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
        })
        .run(req);

    const errors = validationResult(req); //Get all validation errors stored on this request.

    if (!errors.isEmpty())
        return res.status(200).json({success: false, error: errors.array()[0].msg});

    let { username, email, password } = req.body;

    username = username.trim();
    email = email.trim().toLowerCase();
    
    if (username.length < 3 || username.length > 30)
        return res.status(200).json({success: false, error: "Username must be between 3 and 30 characters."});

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
            return res.status(200).json({success: false, error: 'Username or Email already taken'});
        


        const code = randomInt(100000, 1000000).toString();
        const passwordHash = await hash(password, 10);
        const codeHash = await hash(code, 10);
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

            return res.status(503).json({
                success: false,
                error: "Unable to send verification email. Please try again."
            });
        }

        return res.status(202).json({
            success: true,
            registrationId: pending.id,
            message: "Check your email for the verification code."
        });
    }
    catch {
        return res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
};