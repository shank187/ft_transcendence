import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const username = "salah";
    const workoutCount = 101;

    const user = await prisma.user.findUnique({
        where: { username },
    });

    if (!user) {
        throw new Error("User not found. Register this user first.");
    }

    const completedAt = new Date();
    const startedAt = new Date(
        completedAt.getTime() - 60 * 60 * 1000
    );

    for (let i = 1; i <= workoutCount; i++) {
        const id = `seed-progress-${user.id}-${i}`;

        // Ensure this test workout exists.
        await prisma.workoutSession.upsert({
            where: { id },
            update: {},
            create: {
                id,
                userId: user.id,
                status: "COMPLETED",
                startedAt,
                completedAt,
                notes: "Seeded progress test",
            },
        });

        // Ensure this workout has one XP reward.
        await prisma.xpEvent.upsert({
            where: {
                reason_sourceId: {
                    reason: "WORKOUT_COMPLETED",
                    sourceId: id,
                },
            },
            update: {},
            create: {
                userId: user.id,
                reason: "WORKOUT_COMPLETED",
                sourceId: id,
                amount: 100,
            },
        });
    }

    // Read the actual total, including any other XP rewards.
    const result = await prisma.xpEvent.aggregate({
        where: {
            userId: user.id,
        },
        _sum: {
            amount: true,
        },
    });

    console.log(
        `${workoutCount} test workouts and their XP rewards are ready for ${user.username}.`
    );
    console.log(`Total stored XP: ${result._sum.amount ?? 0}`);
}

main()
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });