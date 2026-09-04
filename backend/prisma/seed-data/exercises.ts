import { ExerciseType, PrismaClient } from "@prisma/client";
import type { MuscleGroupName } from "./muscle-groups";
import type { EquipmentName } from "./equipment";

const prisma = new PrismaClient();

export type ExerciseSeed = {
  name: string;
  type: ExerciseType;
  primaryMuscle: MuscleGroupName;
  secondaryMuscles: MuscleGroupName[];
  equipment: EquipmentName[];
};


const exercises: ExerciseSeed[] = [
  {
    name: "Barbell Bench Press",
    type: ExerciseType.WEIGHT_REPS,
    primaryMuscle: "Chest",
    secondaryMuscles: ["Triceps", "Shoulders"],
    equipment: ["Barbell", "Bench"],
  },
];




async function getMuscleGroupByName(name :string) {
    return prisma.muscleGroup.findUniqueOrThrow({
        where: {
            name: name,
        },
    });
}

async function getEquipmentByName(name :string) {
    return prisma.equipment.findUniqueOrThrow({
        where: {
            name: name,
        },
    });
}

async function SeedExercises(){
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
            const secondaryMuscleGroupData = await getMuscleGroupByName(secondaryMuscle);
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
            const equipmentData = await getEquipmentByName(equipment);
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