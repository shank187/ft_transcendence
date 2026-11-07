import { z } from "zod";

export const createWorkoutPlanBody = z.object({
    name: z.string().trim().min(1, "Title is required."),
    description: z.string().trim().nullish(),
});

export type CreateWorkoutPlanBody = z.infer<typeof createWorkoutPlanBody>;