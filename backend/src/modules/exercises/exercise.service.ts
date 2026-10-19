import { prisma } from "../../lib/prisma";
import type { Prisma } from "@prisma/client";
import type { ExerciseFilters, GetExercisesReturn, ListQuery } from "./exercise.types";

export async function getExercises(list: ListQuery): Promise<GetExercisesReturn> {
    const { page, limit, search, muscle, equipment } = list;

    if (muscle && !(await prisma.muscleGroup.findUnique({ where: { id: muscle }, select: { id: true } })))
        return { ok: false, message: "Invalid Muscle" }
    if (equipment && !await prisma.equipment.findUnique({ where: { id: equipment }, select: { id: true } }))
        return { ok: false, message: "Invalid Equipment" }

    const skip = (page - 1) * limit;
    const where: Prisma.ExerciseWhereInput = {}

    if (search) {
        where.name = { contains: search, mode: "insensitive" }
    }
    if (muscle) {
        where.primaryMuscleGroupId = muscle;
    }
    if (equipment) {
        where.equipment = { some: { equipmentId: equipment } }
    }

    const results = await prisma.exercise.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
            name: "asc",
        },
        select: {
            id: true,
            name: true,
            type: true,
            primaryMuscleGroup: {
                select: {
                    name: true,
                },
            },
            secondaryMuscles: {
                select: {
                    muscleGroup: {
                        select: {
                            name: true,
                        },
                    },
                },
            },
            equipment: {
                select: {
                    equipment: {
                        select: {
                            name: true,
                        },
                    },
                },
            },
            description: true,
            imageUrl: true,
        },
    });
    const total = await prisma.exercise.count({ where })
    const totalPages = Math.ceil(total / limit);
    // DTO
    const cleanExercises = results.map((exercise) => {
        return {
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

    return {
        ok: true,
        value: {
            items: cleanExercises,
            page,
            limit,
            total,
            totalPages,
        },
    };
}

export async function getExercisesFilters(): Promise<ExerciseFilters> {
    const whereMuscle: Prisma.MuscleGroupWhereInput = { primaryExercises: { some: {} } }
    const whereEquipment: Prisma.EquipmentWhereInput = { exerciseLinks: { some: {} } }

    const muscleDb = await prisma.muscleGroup.findMany({
        where: whereMuscle,
        orderBy: {
            name: "asc"
        },
        select: {
            id: true,
            name: true,
        }
    })
    const equipmentDb = await prisma.equipment.findMany({
        where: whereEquipment,
        orderBy: {
            name: "asc"
        },
        select: {
            id: true,
            name: true,
        }
    })
    return {
        muscles: muscleDb,
        equipment: equipmentDb
    }
}
