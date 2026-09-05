import { prisma } from "../../app";


export async function getExercises() {
    const results = await prisma.exercise.findMany({
        select:{
            id: true,
            name: true,
            primaryMuscleGroup: {
                select:{
                    name: true,
                },
            },
            secondaryMuscles: {
                select:{
                    muscleGroup:{
                        select:{
                            name: true,
                        },
                    },
                },
            },
            equipment: {
                select:{
                    equipment:{
                        select:{
                            name: true,
                        },
                    },
                },
            },
        },
    });

    // DTO
    const cleanExercises = results.map((exercise) => {
        return{
            id: exercise.id,
            name: exercise.name,
            primaryMuscle: exercise.primaryMuscleGroup.name,
            secondaryMuscles: exercise.secondaryMuscles.map((item) => item.muscleGroup.name),
            equipment: exercise.equipment.map((item) => item.equipment.name),
            
        };
    });
    return cleanExercises;
}
