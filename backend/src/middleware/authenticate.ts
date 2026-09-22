import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
    userId?: string;
}

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer '))
        return res.status(401).json({ message: "Access token is required" });

    let token = authHeader.split(' ')[1];

    const secret = process.env.JWT_SECRET;
    if (!secret)
        return res.status(500).json({ message: "JWT secret is missing" });

    try {
        const decoded = jwt.verify(token, secret);
        if (typeof decoded === "string" || !decoded.userId)
            return res.status(401).json({ message: "Invalid token" });
        req.userId = decoded.userId;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired access token" });
    }
}