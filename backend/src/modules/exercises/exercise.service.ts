import { prisma } from "../../lib/prisma";
import type { Prisma } from "@prisma/client";

export async function getExercises(page: number, limit: number, search ?: string, muscle ?: string, equipment?: string) {

    const skip = (page - 1) * limit;
    const where: Prisma.ExerciseWhereInput = {}
    if(search){
        where.name = { contains: search, mode: "insensitive"}
    }
    if(muscle){
        where.primaryMuscleGroupId = muscle;
    }
    if(equipment){
        where.equipment = {some:{equipmentId: equipment}}
    }
    
    const results = await prisma.exercise.findMany({
        where,
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
    const total = await prisma.exercise.count({where})
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
