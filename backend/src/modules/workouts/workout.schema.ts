import { z } from "zod";

// The frontend checks the same limits in frontend/src/features/workouts/shared/limits.ts.
export const workoutPlanBody = z.object({
    name: z.string().trim().min(1, "Plan name is required.").max(50, "Plan name can't be more than 50 characters."),
    description: z.string().trim().max(200, "Description can't be more than 200 characters.").nullish(),
});

export const MAX_PLANS_PER_USER = 3;

export const MAX_DAYS_PER_PLAN = 7;

export const workoutDayBody = z.object({
    name: z.string().trim().min(1, "Day name is required.").max(30, "Day name can't be more than 30 characters.")
})


export type WorkoutPlanBody = z.infer<typeof workoutPlanBody>;
