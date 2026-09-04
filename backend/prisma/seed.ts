import { ExerciseType, PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();


async function seedMuscleGroups() {
    const muscleGroups = [
        "Upper Back",
        "Lower Back",
        "Chest",
        "Shoulders",
        "Biceps",
        "Triceps",
        "Forearms",
        "Abdominals",
        "Oblique",
        "Quadriceps",
        "Glutes",
        "Hamstrings",
        "Calves"
    ]
    await prisma.muscleGroup.createMany({
        data: muscleGroups.map((name) => ({
            name,
        })),
        skipDuplicates: true
    });

}

async function seedEquipment() {
    
    const equipments = [
        "Chest Press Machine",
        "Chest Fly Machine",
        "DumbbelLs",
        "Barbell",
        "Plates",
        "Lat Pulldown Machine",
        "T-Bar Row Machine",
        "Cable Machine",
        "Leg Press Machine",
        "Leg Extension Machine",
        "Smith Machine",
        "Leg Curl Machine",
        "Rope",
        "Ab Crunch Machine"
    ]
    await prisma.equipment.createMany({
        data: equipments.map((name) => ({
            name,
        })),
        skipDuplicates: true
    });
}

async function seedExercises() {
    const benchPress = await prisma.exercise.upsert({
        where: {
            name: "Barbell Bench Press",
        },
        update: {
            type: ExerciseType.WEIGHT_REPS,
            primaryMuscleGroup: {
                connect: {name: "Chest"},
            },
        },
        create:{
            name: "Barbell Bench Press",
            type: ExerciseType.WEIGHT_REPS,
            primaryMuscleGroup: {
                connect: {name: "Chest"}
            },
        },
    });
    const triceps = await prisma.muscleGroup.findUnique({
        where: {
            name: "Triceps"
        }
    })
    if (!triceps) {
        throw new Error("Triceps muscle group not found");
    }
    const shoulders = await prisma.muscleGroup.findUnique({
        where:{
            name: "Shoulders",
        },
    });
    if (!shoulders) {
        throw new Error("Shoulders muscle group not found");
    }
    await prisma.exerciseSecondaryMuscle.upsert({
        where: {
            exerciseId_muscleGroupId:{
                exerciseId : benchPress.id,
                muscleGroupId: triceps.id,
            },
        },
        update: {},
        create: {
            exerciseId : benchPress.id,
            muscleGroupId: triceps.id
        },
    });
}

async function main() {
    await seedMuscleGroups();
    await seedEquipment();
    await seedExercises();
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
}).finally(async() => {
    await prisma.$disconnect();
});
