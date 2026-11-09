import { z } from "zod";

// The frontend checks the same limits in frontend/src/features/workouts/shared/limits.ts.
// Text a user types is one clean line: no control characters (NUL, line breaks, tabs),
// and a name needs at least one visible character (letter, number, punctuation or symbol, emoji included).
const CONTROL_CHARACTER = /\p{Cc}/u
const VISIBLE_CHARACTER = /[\p{L}\p{N}\p{P}\p{S}]/u

export const workoutPlanBody = z.object({
    name: z.string().trim().min(1, "Plan name is required.").max(50, "Plan name can't be more than 50 characters.")
        .refine(value => !CONTROL_CHARACTER.test(value), "Plan name can't contain line breaks or tabs.")
        .refine(value => VISIBLE_CHARACTER.test(value), "Plan name is required."),
    description: z.string().trim().max(200, "Description can't be more than 200 characters.")
        .refine(value => !CONTROL_CHARACTER.test(value), "Description can't contain line breaks or tabs.").nullish(),
});

export const MAX_PLANS_PER_USER = 3;

export const MAX_DAYS_PER_PLAN = 7;

export const workoutDayBody = z.object({
    name: z.string().trim().min(1, "Day name is required.").max(30, "Day name can't be more than 30 characters.")
        .refine(value => !CONTROL_CHARACTER.test(value), "Day name can't contain line breaks or tabs.")
        .refine(value => VISIBLE_CHARACTER.test(value), "Day name is required."),
})

// Every id in the database is a UUID; anything else in the URL can't match a row.
export const idParam = z.uuid();


export type WorkoutPlanBody = z.infer<typeof workoutPlanBody>;
