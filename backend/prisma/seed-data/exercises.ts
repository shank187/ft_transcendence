import { ExerciseType, PrismaClient } from "@prisma/client";
import type { MuscleGroupName } from "./muscle-groups";
import type { EquipmentName } from "./equipment";


export type ExerciseSeed = {
  name: string;
  type: ExerciseType;
  primaryMuscle: MuscleGroupName;
  secondaryMuscles: MuscleGroupName[];
  equipment: EquipmentName[];
};


const exercises: ExerciseSeed[] = [
  // CHEST
  {
    name: "Barbell Bench Press",
    type: ExerciseType.WEIGHT_REPS,
    primaryMuscle: "Chest",
    secondaryMuscles: ["Triceps", "Shoulders"],
    equipment: ["Barbell", "Bench"],
  },
  {
    name: "Incline Dumbbell Press",
    type: ExerciseType.WEIGHT_REPS,
    primaryMuscle: "Chest",
    secondaryMuscles: ["Shoulders", "Triceps"],
    equipment: ["Dumbbells", "Bench"],
  },
  {
    name: "Chest Press Machine",
    type: ExerciseType.WEIGHT_REPS,
    primaryMuscle: "Chest",
    secondaryMuscles: ["Triceps", "Shoulders"],
    equipment: ["Chest Press Machine"],
  },
  {
    name: "Cable Chest Fly",
    type: ExerciseType.WEIGHT_REPS,
    primaryMuscle: "Chest",
    secondaryMuscles: ["Shoulders"],
    equipment: ["Cable Machine"],
  },

  // UPPER BACK
  {
    name: "Lat Pulldown",
    type: ExerciseType.WEIGHT_REPS,
    primaryMuscle: "Upper Back",
    secondaryMuscles: ["Biceps", "Forearms"],
    equipment: ["Lat Pulldown Machine"],
  },
  {
    name: "T-Bar Row",
    type: ExerciseType.WEIGHT_REPS,
    primaryMuscle: "Upper Back",
    secondaryMuscles: ["Biceps", "Forearms", "Lower Back"],
    equipment: ["T-Bar Row Machine"],
  },
  {
    name: "Barbell Row",
    type: ExerciseType.WEIGHT_REPS,
    primaryMuscle: "Upper Back",
    secondaryMuscles: ["Biceps", "Forearms", "Lower Back"],
    equipment: ["Barbell"],
  },

  // LOWER BACK
  {
    name: "Superman",
    type: ExerciseType.BODYWEIGHT_REPS,
    primaryMuscle: "Lower Back",
    secondaryMuscles: ["Glutes", "Hamstrings"],
    equipment: [],
  },
  {
    name: "Barbell Deadlift",
    type: ExerciseType.WEIGHT_REPS,
    primaryMuscle: "Lower Back",
    secondaryMuscles: ["Glutes", "Hamstrings", "Forearms"],
    equipment: ["Barbell"],
  },

  // SHOULDERS
  {
    name: "Seated Dumbbell Shoulder Press",
    type: ExerciseType.WEIGHT_REPS,
    primaryMuscle: "Shoulders",
    secondaryMuscles: ["Triceps"],
    equipment: ["Dumbbells", "Bench"],
  },
  {
    name: "Dumbbell Lateral Raise",
    type: ExerciseType.WEIGHT_REPS,
    primaryMuscle: "Shoulders",
    secondaryMuscles: [],
    equipment: ["Dumbbells"],
  },
  {
    name: "Rear Delt Cable Fly",
    type: ExerciseType.WEIGHT_REPS,
    primaryMuscle: "Shoulders",
    secondaryMuscles: ["Upper Back"],
    equipment: ["Cable Machine"],
  },

  // BICEPS
  {
    name: "Dumbbell Biceps Curl",
    type: ExerciseType.WEIGHT_REPS,
    primaryMuscle: "Biceps",
    secondaryMuscles: ["Forearms"],
    equipment: ["Dumbbells"],
  },
  {
    name: "Hammer Curl",
    type: ExerciseType.WEIGHT_REPS,
    primaryMuscle: "Biceps",
    secondaryMuscles: ["Forearms"],
    equipment: ["Dumbbells"],
  },

  // TRICEPS
  {
    name: "Rope Triceps Pushdown",
    type: ExerciseType.WEIGHT_REPS,
    primaryMuscle: "Triceps",
    secondaryMuscles: [],
    equipment: ["Cable Machine", "Rope"],
  },
  {
    name: "Barbell Skull Crusher",
    type: ExerciseType.WEIGHT_REPS,
    primaryMuscle: "Triceps",
    secondaryMuscles: [],
    equipment: ["Barbell", "Bench"],
  },

  // FOREARMS
  {
    name: "Dumbbell Wrist Curl",
    type: ExerciseType.WEIGHT_REPS,
    primaryMuscle: "Forearms",
    secondaryMuscles: [],
    equipment: ["Dumbbells", "Bench"],
  },

  // ABDOMINALS
  {
    name: "Ab Crunch Machine",
    type: ExerciseType.WEIGHT_REPS,
    primaryMuscle: "Abdominals",
    secondaryMuscles: [],
    equipment: ["Ab Crunch Machine"],
  },
  {
    name: "Plank",
    type: ExerciseType.DURATION,
    primaryMuscle: "Abdominals",
    secondaryMuscles: ["Oblique", "Lower Back"],
    equipment: [],
  },

  // OBLIQUE
  {
    name: "Side Plank",
    type: ExerciseType.DURATION,
    primaryMuscle: "Oblique",
    secondaryMuscles: ["Abdominals", "Lower Back"],
    equipment: [],
  },

  // QUADRICEPS
  {
    name: "Barbell Back Squat",
    type: ExerciseType.WEIGHT_REPS,
    primaryMuscle: "Quadriceps",
    secondaryMuscles: ["Glutes", "Hamstrings", "Lower Back"],
    equipment: ["Barbell"],
  },
  {
    name: "Leg Press",
    type: ExerciseType.WEIGHT_REPS,
    primaryMuscle: "Quadriceps",
    secondaryMuscles: ["Glutes", "Hamstrings"],
    equipment: ["Leg Press Machine"],
  },
  {
    name: "Leg Extension",
    type: ExerciseType.WEIGHT_REPS,
    primaryMuscle: "Quadriceps",
    secondaryMuscles: [],
    equipment: ["Leg Extension Machine"],
  },

  // GLUTES
  {
    name: "Barbell Hip Thrust",
    type: ExerciseType.WEIGHT_REPS,
    primaryMuscle: "Glutes",
    secondaryMuscles: ["Hamstrings", "Lower Back"],
    equipment: ["Barbell", "Bench"],
  },
  {
    name: "Smith Machine Hip Thrust",
    type: ExerciseType.WEIGHT_REPS,
    primaryMuscle: "Glutes",
    secondaryMuscles: ["Hamstrings"],
    equipment: ["Smith Machine", "Bench"],
  },

  // HAMSTRINGS
  {
    name: "Romanian Deadlift",
    type: ExerciseType.WEIGHT_REPS,
    primaryMuscle: "Hamstrings",
    secondaryMuscles: ["Glutes", "Lower Back", "Forearms"],
    equipment: ["Barbell"],
  },
  {
    name: "Leg Curl",
    type: ExerciseType.WEIGHT_REPS,
    primaryMuscle: "Hamstrings",
    secondaryMuscles: [],
    equipment: ["Leg Curl Machine"],
  },

  // CALVES
  {
    name: "Smith Machine Standing Calf Raise",
    type: ExerciseType.WEIGHT_REPS,
    primaryMuscle: "Calves",
    secondaryMuscles: [],
    equipment: ["Smith Machine"],
  },
  {
    name: "Leg Press Calf Raise",
    type: ExerciseType.WEIGHT_REPS,
    primaryMuscle: "Calves",
    secondaryMuscles: [],
    equipment: ["Leg Press Machine"],
  },
];


async function getMuscleGroupByName(name :string, prisma: PrismaClient) {
    return prisma.muscleGroup.findUniqueOrThrow({
        where: {
            name: name,
        },
    });
}

async function getEquipmentByName(name :string, prisma: PrismaClient) {
    return prisma.equipment.findUniqueOrThrow({
        where: {
            name: name,
        },
    });
}

export async function SeedExercises(prisma: PrismaClient){
    // seeding the exercice ad primary muscle group
    for (const exerciseItem of exercises){
        const exerciseData = await prisma.exercise.upsert({
            where:{
                name: exerciseItem.name,
            },
            update:{
                type: exerciseItem.type,
                primaryMuscleGroup: {
                    connect: {name: exerciseItem.primaryMuscle},
                },
            },
            create :{
                name: exerciseItem.name,
                type: exerciseItem.type,
                primaryMuscleGroup: {
                    connect: {name: exerciseItem.primaryMuscle},
                },
            },
        });
        //seeding the secondary muscle group list in the join table exerciseSecondaryMuscle
        for (const secondaryMuscle of exerciseItem.secondaryMuscles){
            const secondaryMuscleGroupData = await getMuscleGroupByName(secondaryMuscle, prisma);
            await prisma.exerciseSecondaryMuscle.upsert({
                where: {
                    exerciseId_muscleGroupId:{
                        exerciseId: exerciseData.id,
                        muscleGroupId: secondaryMuscleGroupData.id,
                    },
                },
                update:{},
                create: {
                    exerciseId: exerciseData.id,
                    muscleGroupId: secondaryMuscleGroupData.id,
                },
            });
        };        
        for (const equipment of exerciseItem.equipment){
            const equipmentData = await getEquipmentByName(equipment, prisma);
            await prisma.exerciseEquipment.upsert({
                where: {
                    exerciseId_equipmentId:{
                        exerciseId: exerciseData.id,
                        equipmentId: equipmentData.id,
                    },
                },
                update:{},
                create: {
                    exerciseId: exerciseData.id,
                    equipmentId: equipmentData.id,
                },
            });
        };
    };

}