import { prisma } from "../../lib/prisma"

export async function countCompletedWorkouts( userId : string ) : Promise<number> {
    return prisma.workoutSession.count({
        where: {
            userId, status: "COMPLETED",
        },
    });
}