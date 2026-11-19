export type {
    AwardResult, FinishWorkoutResponse, HomeDay, PlanDay, PlanDetail, SetType, WorkoutSession,
    WorkoutSessionExercise, WorkoutSessionSet, WorkoutSessionStatus, WorkoutSummary,
} from "../../../../../shared/workouts"
export type { ExerciseSummary } from "../../../../../shared/exercises"

export interface WorkoutPlanInput
{
    name: string,
    description: string | null,
}
