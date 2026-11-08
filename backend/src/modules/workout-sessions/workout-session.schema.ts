import { z } from "zod";

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

// Every field is optional: only the ones present change, and null clears a value.
export const updateSetBody = z.object({
    weight: z.number().min(0, "Weight can't be negative.").max(1000, "Weight can't be more than 1000.").nullable().optional(),
    reps: z.number().int("Reps must be a whole number.").min(0, "Reps can't be negative.").max(999, "Reps can't be more than 999.").nullable().optional(),
    duration: z.number().int("Duration must be a whole number of seconds.").min(0, "Duration can't be negative.").max(86400, "Duration can't be more than 86400 seconds.").nullable().optional(),
    distance: z.number().min(0, "Distance can't be negative.").max(1000000, "Distance can't be more than 1000000.").nullable().optional(),
    setType: z.enum(["NORMAL", "WARMUP", "DROP", "FAILURE"]).optional(),
    completed: z.boolean().optional(),
}).refine(body => Object.values(body).some(value => value !== undefined), "Nothing to update.");

export type UpdateSetBody = z.infer<typeof updateSetBody>;
