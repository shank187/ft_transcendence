import { Request, Response } from 'express';
import { hash } from 'bcrypt';
import { body, validationResult } from 'express-validator';
import { prisma } from '../../lib/prisma';
import { send_email } from './email.service';
import { generate_verification_code } from './verification_code';

export const resend_verification = async (req: Request, res: Response) => {
    await body('registrationId').isString().notEmpty().run(req);

    const errors = validationResult(req);

    if (!errors.isEmpty()){
        return res.status(400).json({
            success: false,
            error: errors.array()[0].msg
        });
    }

    const registrationId: string = req.body.registrationId;

    try {
        const pending = await prisma.pendingRegistration.findUnique({
            where: {
                id: registrationId
            }
        });

        if (!pending)
        {
            return res.status(409).json({
                success: false,
                error: 'This registration is no longer valid. Please register again.'
            });
        }

        const code = generate_verification_code();
        const codeHash = await hash(code, 10);

        const updated = await prisma.pendingRegistration.updateMany({
            where: {
                id: pending.id,
                codeHash: pending.codeHash
            },
            data: {
                codeHash,
                expiresAt: new Date(Date.now() + 10 * 60 * 1000),
                attempts: 0
            }
        });

        if (updated.count === 0)
        {
            return res.status(409).json({
                success: false,
                error: 'Another resend request was already processed.'
            });
        }

        try {
            await send_email(pending.email, code);
        }
        catch {
            await prisma.pendingRegistration.updateMany({
                where: {
                    id: pending.id,
                    codeHash
                },
                data: {
                    codeHash: pending.codeHash,
                    expiresAt: pending.expiresAt,
                    attempts: pending.attempts
                }
            });

            return res.status(503).json({
                success: false,
                error: 'Unable to send verification email. Please try again.'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Verification code sent'
        });
    }
    catch {
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};