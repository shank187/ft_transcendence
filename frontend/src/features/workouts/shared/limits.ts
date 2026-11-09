// Same limits as the backend; change both together:
//   backend/src/modules/workouts/workout.schema.ts (plans, days)
//   backend/src/modules/workout-sessions/workout-session.schema.ts (workout exercises and sets)
//   backend/src/modules/exercises/exercise.query.ts (search)
export const PLAN_NAME_MAX = 50
export const PLAN_DESCRIPTION_MAX = 200
export const DAY_NAME_MAX = 30
export const MAX_PLANS_PER_USER = 3
export const MAX_DAYS_PER_PLAN = 7
// Per day in the editor and per workout.
export const MAX_EXERCISES = 20
export const MAX_SETS_PER_EXERCISE = 20
export const EXERCISE_SEARCH_MAX = 100
