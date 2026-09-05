import { prisma } from "../../app";


export async function getExercises() {
    const results = await prisma.exercise.findMany({
        orderBy: {
            name: "asc",
        },
        select:{
            id: true,
            name: true,
            type: true,
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
            description: true,
            imageUrl: true,
            demoUrl: true,
        },
    });

    // DTO
    const cleanExercises = results.map((exercise) => {
        return{
            id: exercise.id,
            name: exercise.name,
            type: exercise.type,
            primaryMuscle: exercise.primaryMuscleGroup.name,
            secondaryMuscles: exercise.secondaryMuscles.map((item) => item.muscleGroup.name),
            equipment: exercise.equipment.map((item) => item.equipment.name),
            description: exercise.description,
            imageUrl: exercise.imageUrl,
            demoUrl: exercise.demoUrl
        };
    });
    return cleanExercises;
}
