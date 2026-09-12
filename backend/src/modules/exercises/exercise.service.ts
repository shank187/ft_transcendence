import { prisma } from "../../app";


export async function getExercises(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const results = await prisma.exercise.findMany({
        skip,
        take: limit,
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
        },
    });
    const total = await prisma.exercise.count()
    const totalPages = Math.ceil(total/ limit);
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
        };
    });
    return{
        items: cleanExercises,
        page,
        limit,
        total,
        totalPages,
    };
}
