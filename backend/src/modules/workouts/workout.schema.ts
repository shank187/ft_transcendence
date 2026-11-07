import { z } from "zod";

export const createWorkoutPlanBody = z.object({
    name: z.string().trim().min(1, "name is required."),
    description: z.string().trim().nullish(),
});

export const createWorkoutDayBody = z.object({
    name: z.string().trim().min(1, "name is required.")
})

export type CreateWorkoutPlanBody = z.infer<typeof createWorkoutPlanBody>;