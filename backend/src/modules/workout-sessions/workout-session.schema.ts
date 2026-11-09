import { z } from "zod";

// The frontend checks the same limits in frontend/src/features/workouts/shared/limits.ts.

// Discarding is the only status change the client can ask for here;
// finishing has its own route.
export const discardSessionBody = z.object({
    status: z.literal("CANCELLED"),
});

export const MAX_EXERCISES_PER_SESSION = 20;

export const addExercisesBody = z.object({
    exerciseIds: z.array(z.string().min(1, "Exercise not found."))
        .min(1, "Pick at least one exercise.")
        .max(MAX_EXERCISES_PER_SESSION, `A workout can have at most ${MAX_EXERCISES_PER_SESSION} exercises.`)
        .refine(ids => new Set(ids).size === ids.length, "Pick each exercise only once."),
});

export const MAX_SETS_PER_EXERCISE = 20;

const WEIGHT_MESSAGE = "Weight must be between 0 and 1000 kg."
const REPS_MESSAGE = "Reps must be a whole number between 1 and 999."
const DURATION_MESSAGE = "Time must be a whole number of seconds, 1 to 86400."
const DISTANCE_MESSAGE = "Distance must be between 0 and 1000000 m."

// Same rules and messages as frontend/src/features/workouts/shared/set-values.ts.
// Every field is optional: only the ones present change, and null clears a value.
export const updateSetBody = z.object({
    weight: z.number().min(0, WEIGHT_MESSAGE).max(1000, WEIGHT_MESSAGE)
        .refine(value => Number(value.toFixed(2)) === value, WEIGHT_MESSAGE).nullable().optional(),
    reps: z.number().int(REPS_MESSAGE).min(1, REPS_MESSAGE).max(999, REPS_MESSAGE).nullable().optional(),
    duration: z.number().int(DURATION_MESSAGE).min(1, DURATION_MESSAGE).max(86400, DURATION_MESSAGE).nullable().optional(),
    distance: z.number().gt(0, DISTANCE_MESSAGE).max(1000000, DISTANCE_MESSAGE)
        .refine(value => Number(value.toFixed(1)) === value, DISTANCE_MESSAGE).nullable().optional(),
    setType: z.enum(["NORMAL", "WARMUP", "DROP", "FAILURE"]).optional(),
    completed: z.boolean().optional(),
}).refine(body => Object.values(body).some(value => value !== undefined), "Nothing to update.");

export type UpdateSetBody = z.infer<typeof updateSetBody>;
