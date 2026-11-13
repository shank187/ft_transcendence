export type {
    AwardResult, FinishWorkoutResponse, PlanDay, PlanDetail, PlannedSet, SetType, WorkoutSession,
    WorkoutSessionExercise, WorkoutSessionSet, WorkoutSessionStatus, WorkoutSummary,
} from "../../../../../shared/workouts"
export type { ExerciseSummary } from "../../../../../shared/exercises"

export interface WorkoutPlanInput
{
    name: string,
    description: string | null,
}
