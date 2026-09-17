import jwt from 'jsonwebtoken';

export function sign_access_token(userId: string)
{
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET as string,
        { expiresIn: '15m' }
    );
}