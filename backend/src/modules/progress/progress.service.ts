import { prisma } from "../../lib/prisma"

export async function countCompletedWorkouts( userId : string ) : Promise<number> {
    return prisma.workoutSession.count({
        where: {
            userId, status: "COMPLETED",
        },
    });
}

export async function getTotalXp(
    userId: string
): Promise<number> {
    const result = await prisma.xpEvent.aggregate({
        where: {
            userId,
        },
        _sum: {
            amount: true,
        },
    });

    return result._sum.amount ?? 0;
}