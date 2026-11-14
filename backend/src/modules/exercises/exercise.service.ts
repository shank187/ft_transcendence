import { prisma } from "../../lib/prisma";
import type { Prisma } from "@prisma/client";
import type { ExerciseListQuery } from "./exercise.schema";
import type { ExerciseFilters, ExerciseItem, ExerciseList } from "./exercise.types";

const exerciseListSelect = {
    id: true,
    name: true,
    type: true,
    primaryMuscleGroup: { select: { name: true } },
    secondaryMuscles: { select: { muscleGroup: { select: { name: true } } } },
    equipment: { select: { equipment: { select: { name: true } } } },
    description: true,
    imageUrl: true,
} satisfies Prisma.ExerciseSelect;

// Muscle groups and equipment are both shown as { id, name } options.
const filterOptionSelect = {
    id: true,
    name: true,
} satisfies Prisma.MuscleGroupSelect & Prisma.EquipmentSelect;

const filterCurrentGymSelect = {
    currentGym: { select: { id: true, name: true } },
} satisfies Prisma.UserSelect;

type ExerciseRowDb = Prisma.ExerciseGetPayload<{ select: typeof exerciseListSelect }>;

function toExerciseItemDto(exercise: ExerciseRowDb): ExerciseItem
{
    return {
        id: exercise.id,
        name: exercise.name,
        type: exercise.type,
        primaryMuscle: exercise.primaryMuscleGroup.name,
        secondaryMuscles: exercise.secondaryMuscles.map((item) => item.muscleGroup.name),
        equipment: exercise.equipment.map((item) => item.equipment.name),
        description: exercise.description,
        imageUrl: exercise.imageUrl,
    }
}

type ExerciseListResult =
    | { ok: true; list: ExerciseList }
    | { ok: false; reason: "MUSCLE_NOT_FOUND" | "EQUIPMENT_NOT_FOUND" | "NO_CURRENT_GYM" };

export async function getExercises(query: ExerciseListQuery, userId: string): Promise<ExerciseListResult> {
    const { page, limit, search, muscle, equipment, gym, sort } = query;

    if (muscle && !(await prisma.muscleGroup.findUnique({ where: { id: muscle }, select: { id: true } })))
        return { ok: false, reason: "MUSCLE_NOT_FOUND" }
    if (equipment && !await prisma.equipment.findUnique({ where: { id: equipment }, select: { id: true } }))
        return { ok: false, reason: "EQUIPMENT_NOT_FOUND" }
    let currentGymId: string | null = null
    if (gym) {
        const user = await prisma.user.findUnique({ where: { id: userId }, select: { currentGymId: true } })
        currentGymId = user?.currentGymId ?? null
        if (!currentGymId)
            return { ok: false, reason: "NO_CURRENT_GYM" }
    }

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
    // Spread keeps the equipment filter: both filters live on the same relation.
    // every: all of the exercise's equipment is at the gym (no equipment also matches).
    if (currentGymId) {
        where.equipment = { ...where.equipment, every: { equipment: { gyms: { some: { gymId: currentGymId } } } } }
    }

    const results = await prisma.exercise.findMany({
        where,
        skip,
        take: limit,
        // id breaks ties, so the same row never lands on two pages.
        orderBy: [{ name: sort === "name_desc" ? "desc" : "asc" }, { id: "asc" }],
        select: exerciseListSelect,
    });
    const total = await prisma.exercise.count({ where })
    const totalPages = Math.ceil(total / limit);

    return {
        ok: true,
        list: {
            items: results.map(toExerciseItemDto),
            page,
            limit,
            total,
            totalPages,
        },
    };
}

export async function getExercisesFilters(userId: string): Promise<ExerciseFilters> {
    const whereMuscle: Prisma.MuscleGroupWhereInput = { primaryExercises: { some: {} } }
    const whereEquipment: Prisma.EquipmentWhereInput = { exerciseLinks: { some: {} } }

    const muscleDb = await prisma.muscleGroup.findMany({
        where: whereMuscle,
        orderBy: {
            name: "asc"
        },
        select: filterOptionSelect,
    })
    const equipmentDb = await prisma.equipment.findMany({
        where: whereEquipment,
        orderBy: {
            name: "asc"
        },
        select: filterOptionSelect,
    })
    const userDb = await prisma.user.findUnique({
        where: { id: userId },
        select: filterCurrentGymSelect,
    })
    return {
        muscles: muscleDb,
        equipment: equipmentDb,
        gym: userDb?.currentGym ?? null,
    }
}
