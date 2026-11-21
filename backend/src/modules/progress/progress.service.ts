import { prisma } from "../../lib/prisma"
import type { Prisma } from "@prisma/client"
import { getWorkoutStats } from "../workout-sessions/workout-stats";

import {
    XP_PER_WORKOUT,
    XP_PER_PR,
    getLevel,
} from "./progress.rules";

export type AwardEvent = {
    reason: "WORKOUT_COMPLETED" | "PR_SET";
    sourceId: string;
};

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

///// add prisma enum
const WorkoutTimes = [
    { code: "EARLY_BIRD", from: 5, to: 9 },
    { code: "NIGHT_OWL", from: 22, to: 5 },
];

export async function unlockWorkoutAchievements(
    userId: string,
    tx: Prisma.TransactionClient = prisma
): Promise<string[]> {
    const workouts = await tx.workoutSession.findMany({
        where: {
            userId,
            status: "COMPLETED",
        },
        select: {
            completedAt: true,
        },
    });

    const earnedCodes = workoutMilestones
        .filter(
            (achievement) =>
                workouts.length >= achievement.requiredWorkouts
        )
        .map((achievement) => achievement.code);

    for (const achievement of WorkoutTimes) {
        const qualifies = workouts.some((workout) => {
            if (!workout.completedAt) return false;

            const hour = workout.completedAt.getUTCHours();

            if (achievement.from < achievement.to) {
                return (
                    hour >= achievement.from &&
                    hour < achievement.to
                );
            }

            // A range crossing midnight, such as 22:00–05:00.
            return (
                hour >= achievement.from ||
                hour < achievement.to
            );
        });

        if (qualifies) {
            earnedCodes.push(achievement.code);
        }
    }

    const unlocked: string[] = [];

    for (const code of earnedCodes) {
        const result = await tx.userAchievement.createMany({
            data: [{
                userId,
                code,
            }],
            skipDuplicates: true,
        });

        if (result.count > 0) {
            unlocked.push(code);
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
            OR: [
                { id: userId },
                {
                    //// ////
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

////////////////////// award funciton 
export async function award(
    tx: Prisma.TransactionClient,
    userId: string,
    events: AwardEvent[]
) {
    // 1. Keep simultaneous award calls for this user in order.
    await tx.$queryRaw`
        SELECT "id" FROM "User"
        WHERE "id" = ${userId}
        FOR UPDATE
    `;

    // 2. Read the user's current XP.
    const previous = await tx.xpEvent.aggregate({
        where: { userId },
        _sum: { amount: true },
    });

    const previousXp = previous._sum.amount ?? 0;
    let xpGained = 0;

    // 3. Save XP for each new event.
    for (const event of events) {
        const amount =
            event.reason === "WORKOUT_COMPLETED"
                ? XP_PER_WORKOUT
                : XP_PER_PR;

        const result = await tx.xpEvent.createMany({
            data: [{
                userId,
                reason: event.reason,
                sourceId: event.sourceId,
                amount,
            }],
            skipDuplicates: true,
        });

        xpGained += result.count * amount;
    }

    // 4. Save newly earned achievement unlocks.
    const unlocked = await unlockWorkoutAchievements(userId, tx);
    // 5. Return feedback for the finish response.
    return {
        xpGained,
        levelUp:
            getLevel(previousXp + xpGained) > getLevel(previousXp),
        unlocked,
    };
}

//////////////////stats from date to date

export async function getWeeklyStats(userId: string) {
    const from = new Date();

    //first monday
    const daySincemonday = (from.getUTCDate() + 6) % 7;
    from.setUTCDate(from.getUTCDate() - daySincemonday);
    from.setUTCHours(0, 0, 0, 0);

    const to = new Date(from);
    to.setUTCDate(to.getUTCDate() + 7);
    
    return getWorkoutStats(userId, from, to);

}