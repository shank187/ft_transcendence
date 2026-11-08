import { z } from "zod";

// The frontend checks the same limits in frontend/src/features/workouts/workout.limits.ts.
export const createWorkoutPlanBody = z.object({
    name: z.string().trim().min(1, "Plan name is required.").max(50, "Plan name can't be more than 50 characters."),
    description: z.string().trim().max(200, "Description can't be more than 200 characters.").nullish(),
});

export const createWorkoutDayBody = z.object({
    name: z.string().trim().min(1, "Day name is required.").max(30, "Day name can't be more than 30 characters.")
})


export type CreateWorkoutPlanBody = z.infer<typeof createWorkoutPlanBody>;
