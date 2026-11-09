import { prisma } from "../../lib/prisma"
import type { Prisma } from "@prisma/client"

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

export async function unlockWorkoutAchievements(
    userId: string,
    tx: Prisma.TransactionClient = prisma
): Promise<string[]> {
    // Read completed workouts using the supplied client.
    const completedWorkouts = await tx.workoutSession.count({
        where: {
            userId,
            status: "COMPLETED",
        },
    });

    const unlocked: string[] = [];

    for (const achievement of workoutMilestones) {
        if (completedWorkouts < achievement.requiredWorkouts) {
            continue;
        }

        // Try saving the earned achievement.
        const result = await tx.userAchievement.createMany({
            data: [{
                userId,
                code: achievement.code,
            }],
            skipDuplicates: true,
        });

        // Report it only if this call created the unlock.
        if (result.count > 0) {
            unlocked.push(achievement.code);
        }
    }
    return unlocked;
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
export async function getLeaderboardEntries(userId: string) {
    let users = await prisma.user.findMany({
        where: {
            id: { not: userId },
            OR: [
                {
                    receivedFriendships: {
                        some: {
                            requesterId: userId,
                            status: "ACCEPTED",
                            blockedById: null,
                        },
                    },
                },
                {
                    sentFriendships: {
                        some: {
                            addresseeId: userId,
                            status: "ACCEPTED",
                            blockedById: null,
                        },
                    },
                },
            ],
        },
        select: {
            id: true,
            username: true,
        },
    });

// Handle zero friends.
    if (users.length === 0) {
        users = await prisma.user.findMany({
            where: {
                id: userId,
            },
            select: {
                id: true,
                username: true,
            },
        });
    }

    // Calculate stored XP for these friends only.
    const xpTotals = await prisma.xpEvent.groupBy({
        by: ["userId"],
        where: {
            userId: {
                in: users.map((user) => user.id),
            },
        },
        _sum: {
            amount: true,
        },
    });

    const xpByUser = new Map(
        xpTotals.map((entry) => [
            entry.userId,
            entry._sum.amount ?? 0,
        ])
    );

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