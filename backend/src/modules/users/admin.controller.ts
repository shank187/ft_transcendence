import { Response } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../../lib/prisma';
import { AuthenticatedRequest } from '../../middleware/authenticate';

export async function add_admin(req: AuthenticatedRequest, res: Response)
{
    if (!req.userId)
        return res.status(401).json({ success: false, error: "Unauthorized." });

    try {
        const admin_role = await prisma.userRole.findFirst({
            where: { userId: req.userId, role: { name: "ADMIN" } },
        });

        if (!admin_role)
            return res.status(403).json({ success: false, error: "Only admins can add another admin." });

        await body('email').isString().trim().isEmail().run(req);

        if (!validationResult(req).isEmpty())
            return res.status(400).json({ success: false, error: "Please enter a valid email address." });

        const email = req.body.email.toLowerCase();
        const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true }
        });

        if (!user)
            return res.status(404).json({ success: false, error: "No user found with this email address." });

        await prisma.userRole.upsert({
            where: {
                userId_roleId: { userId: user.id, roleId: admin_role.roleId },
            },
            update: {},
            create: { userId: user.id, roleId: admin_role.roleId },
        });

        return res.status(200).json({ success: true, message: "Admin added successfully." });
    } catch {
        return res.status(500).json({ success: false, error: "Could not add admin. Please try again." });
    }
}
