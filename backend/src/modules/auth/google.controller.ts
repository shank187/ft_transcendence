import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import crypto from 'crypto';

import { prisma } from '../../lib/prisma';
import { create_session } from './session.service';

import {refreshCookieName,refreshCookieOptions} from './cookie.config';

const googleClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

export const googleLogin = async (_req: Request, res: Response) => {
    const state = crypto.randomBytes(32).toString('hex');

    res.cookie('google_oauth_state', state, {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 10 * 60 * 1000
    });

    const url = googleClient.generateAuthUrl({
        scope: ['openid', 'email', 'profile'],
        state
    });

    res.redirect(url);
};


export const googleCallback = async (req: Request, res: Response) => {
    try {
        const code = req.query.code;// Temporary code sent by Google

        const state = req.query.state;  // State value returned by Google
        const savedState = req.cookies.google_oauth_state;  // State value we saved before going to Google

       res.clearCookie('google_oauth_state', {
        httpOnly: true,
        sameSite: 'lax'
        });

        if (typeof code !== 'string' || typeof state !== 'string' || state !== savedState) // Check that the Google request is valid
            return res.status(400).json({ error: 'Invalid Google request' });

        const { tokens } = await googleClient.getToken(code); // Send the temporary code to Google and get tokens

        if (!tokens.id_token)
            return res.status(401).json({ error: 'Google login failed' });


        // Check that the ID token is valid and belongs to our app
        const ticket = await googleClient.verifyIdToken({
            idToken: tokens.id_token,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        // Get the user information from the Google token
        const googleUser = ticket.getPayload();

        // Make sure the Google user has valid information
        if (!googleUser || !googleUser.email || !googleUser.sub || !googleUser.email_verified) //means the email is trusted by Google.
            return res.status(401).json({ error: 'Invalid Google account' });

        const email = googleUser.email.toLowerCase();

        let user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    email,
                    googleId: googleUser.sub,
                    passwordHash: null,

                    username: email.split('@')[0] + '_' + crypto.randomBytes(2).toString('hex'),

                    displayName: googleUser.name
                }
            });
        }
        else if (!user.googleId) {
            user = await prisma.user.update({
                where: { id: user.id },
                data: { googleId: googleUser.sub }
            });
        }

        const { raw_token } = await create_session(user.id);

        res.cookie(refreshCookieName, raw_token, refreshCookieOptions);

        if (!user.onboardingCompletedAt)
            return res.redirect('http://localhost:5173/onboarding');

        return res.redirect('http://localhost:5173/home');
    }
    catch {
        return res.redirect(
            'http://localhost:5173/login?error=google'
        );
    }
};