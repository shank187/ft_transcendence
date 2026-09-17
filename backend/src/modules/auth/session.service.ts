import crypto from 'crypto';
import { Session} from '@prisma/client';
import jwt from 'jsonwebtoken';

import { prisma } from '../../lib/prisma';



const refresh_token_ttl_ms = 7 * 24 * 60 * 60 * 1000;



function generate_raw_refresh_token(user_id: string): string
{
    return jwt.sign(
        {
            userId: user_id,
            jti: crypto.randomUUID() 
        },
        process.env.JWT_REFRESH_SECRET as string,
        { expiresIn: '7d' }
    );
}



function hash_refresh_token(raw_token: string): string
{
    return crypto
        .createHash('sha256')
        .update(raw_token)
        .digest('hex');
}



export async function create_session(user_id: string): Promise<{ raw_token: string; session: Session }>
{

    const raw_token = generate_raw_refresh_token(user_id);


    const token_hash = hash_refresh_token(raw_token);


    const expires_at = new Date( Date.now() + refresh_token_ttl_ms);

    const session = await prisma.session.create({
        data: {
            userId: user_id,
            tokenHash: token_hash,
            expiresAt: expires_at
        },
    });


    return {raw_token, session};
}



export async function find_session_by_raw_token(raw_token: string): Promise<Session | null>
{
    const token_hash = hash_refresh_token(raw_token);

    return prisma.session.findUnique({
        where: {tokenHash: token_hash}
    });
}



export async function revoke_session(session_id: string)
{
    return prisma.session.update({
        where: {
            id: session_id
        },

        data: {
            revokedAt: new Date()
        },
    });
}