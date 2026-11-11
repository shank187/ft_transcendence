import { z } from "zod";
import {
    CONTROL_CHARACTER, MAX_EXERCISES, MAX_SETS_PER_EXERCISE, VISIBLE_CHARACTER, distanceValue, durationValue,
    exerciseIdValue, repsValue, restSecondsValue, setTypeValue, weightValue,
} from "../../lib/validation";

// The frontend checks the same limits in frontend/src/features/workouts/shared/limits.ts.
// Rules the other S3 modules also use are in backend/src/lib/validation.ts.

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

// The whole day from the day editor's Save. Array position is the order:
// exercise i gets order i + 1, set j gets setNumber j + 1. Keys like id or order are dropped.
// A target the exercise type doesn't use arrives as null.
export const saveDayBody = z.object({
    exercises: z.array(
        z.object({
            exerciseId: exerciseIdValue,
            restSeconds: restSecondsValue.nullable(),
            sets: z.array(z.object({
                setType: setTypeValue,
                targetWeight: weightValue.nullable(),
                targetReps: repsValue.nullable(),
                targetDuration: durationValue.nullable(),
                targetDistance: distanceValue.nullable(),
            })).max(MAX_SETS_PER_EXERCISE, `An exercise can have at most ${MAX_SETS_PER_EXERCISE} sets.`),
        })
    ).max(MAX_EXERCISES, `A day can have at most ${MAX_EXERCISES} exercises.`),
})

export type WorkoutPlanBody = z.infer<typeof workoutPlanBody>;
