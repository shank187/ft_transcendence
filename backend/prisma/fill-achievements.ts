import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import {
    unlockWorkoutAchievements,
    getUnlockedAchievements,
} from "../src/modules/progress/progress.service";

async function main() {
    // Find users who already have completed workouts.
    const users = await prisma.workoutSession.findMany({
        where: {
            status: "COMPLETED",
        },
        select: {
            userId: true,
        },
        distinct: ["userId"],
    });

    for (const { userId } of users) {
        // Save any milestones this user has earned.
        await unlockWorkoutAchievements(userId);

        // Display the saved results.
        const achievements = await getUnlockedAchievements(userId);

        console.log(userId, achievements);
    }
}

main()
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
