import { z } from "zod";
import { MAX_EXERCISES, distanceValue, durationValue, exerciseIdValue, repsValue, setTypeValue, weightValue } from "../../lib/validation";

// The frontend checks the same limits in frontend/src/features/workouts/shared/limits.ts.
// Rules the other S3 modules also use are in backend/src/lib/validation.ts.

// Discarding is the only status change the client can ask for here;
// finishing has its own route.
export const discardSessionBody = z.object({
    status: z.literal("CANCELLED"),
});

// Workouts started in the last 24 hours, discarded ones included.
export const MAX_WORKOUTS_PER_DAY = 5;

// {} starts an empty workout; { dayId } starts from that day.
export const startSessionBody = z.object({
    dayId: z.uuid("Day not found.").optional(),
}, "Send a JSON body: {} or { \"dayId\": \"...\" }.");

const DIRECTION_MESSAGE = "Direction must be -1 (up) or 1 (down)."

export const moveExerciseBody = z.object({
    direction: z.union([z.literal(-1), z.literal(1)], DIRECTION_MESSAGE),
});

export const addExercisesBody = z.object({
    exerciseIds: z.array(exerciseIdValue)
        .min(1, "Pick at least one exercise.")
        .max(MAX_EXERCISES, `A workout can have at most ${MAX_EXERCISES} exercises.`)
        .refine(ids => new Set(ids).size === ids.length, "Pick each exercise only once."),
});

// Every field is optional: only the ones present change, and null clears a value.
export const updateSetBody = z.object({
    weight: weightValue.nullable().optional(),
    reps: repsValue.nullable().optional(),
    duration: durationValue.nullable().optional(),
    distance: distanceValue.nullable().optional(),
    setType: setTypeValue.optional(),
    completed: z.boolean().optional(),
}).refine(body => Object.values(body).some(value => value !== undefined), "Nothing to update.");

export type UpdateSetBody = z.infer<typeof updateSetBody>;
