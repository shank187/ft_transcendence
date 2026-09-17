import { Request, Response } from 'express';
import { hash } from 'bcrypt';
import { body, validationResult } from 'express-validator';

import {refreshCookieName,refreshCookieOptions} from './cookie.config';
import { sign_access_token } from './token.service';

import { create_session } from './session.service';

import { prisma } from '../../lib/prisma';



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

        res.cookie(refreshCookieName, raw_token, refreshCookieOptions);

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