import { ExerciseType, PrismaClient } from "@prisma/client";
import { z } from "zod";
import { MUSCLE_GROUPS } from "./muscle-groups";
import { EQUIPMENT } from "./equipment";
import data from "./exercises.json";

// The catalog lives in exercises.json (see README.md); this file only checks it and writes it.
// Muscle groups and equipment are written by name in the file and must exist in
// MUSCLE_GROUPS and EQUIPMENT, so a typo fails here and not as a missing link in the database.
const muscleGroup = z.enum(MUSCLE_GROUPS, "not a name in MUSCLE_GROUPS (muscle-groups.ts)");
const equipmentName = z.enum(EQUIPMENT.map((item) => item.name), "not a name in EQUIPMENT (equipment.ts)");

const exerciseRow = z.strictObject({
    sourceId: z.string().min(1).nullable(),
    name: z.string().trim().min(1),
    type: z.enum(ExerciseType),
    primaryMuscle: muscleGroup,
    secondaryMuscles: z.array(muscleGroup),
    equipment: z.array(equipmentName),
    description: z.string().min(1).nullable(),
    image: z.string().regex(/^[a-z0-9-]+\.jpg$/).nullable(),
    // Checked now, written later: the schema has no column for these yet.
    difficulty: z.enum(["beginner", "intermediate", "advanced"]).nullable(),
    instructions: z.string(),
    formCues: z.array(z.string()),
    commonMistakes: z.array(z.string()),
    aliases: z.array(z.string()),
});

export type ExerciseSeed = z.infer<typeof exerciseRow>;

function nameAt(index: unknown): string
{
    const row = typeof index === "number" ? (data as { name?: unknown }[])[index] : undefined;
    return typeof row?.name === "string" ? row.name : `row ${String(index)}`;
}

// Checks the whole file before anything is written.
function parseExercises(): ExerciseSeed[]
{
    const parsed = z.array(exerciseRow).safeParse(data);
    if (!parsed.success) {
        const issue = parsed.error.issues[0];
        const [index, ...field] = issue.path;
        throw new Error(`exercises.json: "${nameAt(index)}", field "${field.join(".") || "(row)"}": ${issue.message}`);
    }
    const seen = new Set<string>();
    for (const exercise of parsed.data) {
        if (seen.has(exercise.name))
            throw new Error(`exercises.json: "${exercise.name}", field "name": used twice`);
        seen.add(exercise.name);
        if (exercise.secondaryMuscles.includes(exercise.primaryMuscle))
            throw new Error(`exercises.json: "${exercise.name}", field "secondaryMuscles": repeats the primary muscle`);
    }
    return parsed.data;
}

// Safe to run again: every exercise is upserted by name and its links are rebuilt from the file.
export async function seedExercises(prisma: PrismaClient)
{
    const exercises = parseExercises();

    const muscleRows = await prisma.muscleGroup.findMany({ select: { id: true, name: true } });
    const equipmentRows = await prisma.equipment.findMany({ select: { id: true, name: true } });
    const muscleIds = new Map(muscleRows.map((row) => [row.name, row.id]));
    const equipmentIds = new Map(equipmentRows.map((row) => [row.name, row.id]));

    const idOf = (ids: Map<string, string>, name: string, exercise: string): string => {
        const id = ids.get(name);
        if (!id)
            throw new Error(`"${exercise}": "${name}" is not in the database; seed muscle groups and equipment first`);
        return id;
    };

    for (const exercise of exercises) {
        const fields = {
            type: exercise.type,
            description: exercise.description,
            imageUrl: exercise.image ? `/exercise-images/${exercise.image}` : null,
            primaryMuscleGroupId: idOf(muscleIds, exercise.primaryMuscle, exercise.name),
        };
        const secondaryIds = exercise.secondaryMuscles.map((name) => idOf(muscleIds, name, exercise.name));
        const requiredIds = exercise.equipment.map((name) => idOf(equipmentIds, name, exercise.name));

        // All or nothing per exercise: it never keeps half of its old links.
        await prisma.$transaction(async (tx) => {
            const row = await tx.exercise.upsert({
                where: { name: exercise.name },
                update: fields,
                create: { name: exercise.name, ...fields },
                select: { id: true },
            });
            await tx.exerciseSecondaryMuscle.deleteMany({ where: { exerciseId: row.id } });
            await tx.exerciseEquipment.deleteMany({ where: { exerciseId: row.id } });
            await tx.exerciseSecondaryMuscle.createMany({
                data: secondaryIds.map((muscleGroupId) => ({ exerciseId: row.id, muscleGroupId })),
            });
            await tx.exerciseEquipment.createMany({
                data: requiredIds.map((equipmentId) => ({ exerciseId: row.id, equipmentId })),
            });
        });
    }

    // An exercise that left the file is removed only when no plan and no workout uses it:
    // plans and history must keep pointing at a real exercise.
    const names = exercises.map((exercise) => exercise.name);
    const removed = await prisma.exercise.deleteMany({
        where: { name: { notIn: names }, workoutExercises: { none: {} }, sessionExercises: { none: {} } },
    });
    const keptInUse = await prisma.exercise.count({ where: { name: { notIn: names } } });
    console.log(`Exercises: ${exercises.length} in the file, ${removed.count} old removed, ${keptInUse} old kept because a plan or a workout uses them.`);
}
