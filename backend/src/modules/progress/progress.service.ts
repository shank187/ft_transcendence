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

//////////////// achievements
const workoutMilestones = [
    { code: "WORKOUTS_1", requiredWorkouts: 1 },
    { code: "WORKOUTS_10", requiredWorkouts: 10 },
    { code: "WORKOUTS_50", requiredWorkouts: 50 },
    { code: "WORKOUTS_100", requiredWorkouts: 100 },
];

export async function unlockWorkoutAchievements(userId: string) {
    const completedWorkouts = await countCompletedWorkouts(userId);

    const earnedAchievements = workoutMilestones.filter(
        (achievement) =>
            completedWorkouts >= achievement.requiredWorkouts
    );

    if (earnedAchievements.length === 0) return;

    await prisma.userAchievement.createMany({
        data: earnedAchievements.map((achievement) => ({
            userId,
            code: achievement.code,
        })),
        skipDuplicates: true,
    });
}

export async function getUnlockedAchievements(userId: string) {
    return prisma.userAchievement.findMany({
        where: { userId },
        select: {
            code: true,
            unlockedAt: true,
        },
        orderBy: {
            unlockedAt: "asc",
        },
    });
}


//////////// leadeboard
export async function getLeaderboardEntries() {
    // Get public identities.
    const users = await prisma.user.findMany({
        select: {
            id: true,
            username: true,
        },
    });

    // Calculate each user's stored XP.
    const xpTotals = await prisma.xpEvent.groupBy({
        by: ["userId"],
        _sum: {
            amount: true,
        },
    });

    // Associate each user ID with their total XP.
    const xpByUser = new Map(
        xpTotals.map((entry) => [
            entry.userId,
            entry._sum.amount ?? 0,
        ])
    );

    // Combine identities with XP and rank them.
    return users
        .map((user) => ({
            id: user.id,
            username: user.username,
            xp: xpByUser.get(user.id) ?? 0,
        }))
        .sort(
            (a, b) =>
                b.xp - a.xp ||
                a.username.localeCompare(b.username)
        );
}