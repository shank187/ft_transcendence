import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

export async function seedAdmin(prisma: PrismaClient) {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
        throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const adminRole = await prisma.role.upsert({
        where: {
            name: "ADMIN",
        },
        update: {},
        create: {
            name: "ADMIN",
        },
    });

    let admin_user = await prisma.user.findUnique({
        where: {email}
    });

    if (!admin_user)
    {
        admin_user = await prisma.user.create({
            data: {
                email,
                username: "admin",
                passwordHash
            }
        });
    }


    await prisma.userRole.upsert({
        where: {
            userId_roleId: {
                userId: admin_user.id,
                roleId: adminRole.id,
            }
        },
        update: {},
        create: {
            userId: admin_user.id,
            roleId: adminRole.id,
        }
    });
    
}