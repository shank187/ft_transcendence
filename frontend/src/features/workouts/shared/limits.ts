// Same limits as the backend; change both together:
//   backend/src/modules/workouts/workout.schema.ts (plans, days)
//   backend/src/lib/validation.ts (exercises per day and workout, sets, set values, rest, text rules)
//   backend/src/modules/exercises/exercise.schema.ts (search)
export const PLAN_NAME_MAX = 50
export const PLAN_DESCRIPTION_MAX = 200
export const DAY_NAME_MAX = 30
export const MAX_PLANS_PER_USER = 3
export const MAX_DAYS_PER_PLAN = 7
// Per day in the editor and per workout.
export const MAX_EXERCISES = 20
export const MAX_SETS_PER_EXERCISE = 20
export const EXERCISE_SEARCH_MAX = 100

// Same text rule as the backend schemas: one clean line, no control characters
// (line breaks, tabs), and a name needs at least one visible character.
// Lengths count characters like the backend: [...text].length, so an emoji counts as one.
export const CONTROL_CHARACTER = /\p{Cc}/u
export const VISIBLE_CHARACTER = /[\p{L}\p{N}\p{P}\p{S}]/u

// Same checks and messages as workoutPlanBody on the backend.
export function planInputError(name: string, description: string): string | null
{
    if (!VISIBLE_CHARACTER.test(name)) return "Plan name is required."
    if ([...name.trim()].length > PLAN_NAME_MAX) return `Plan name can't be more than ${PLAN_NAME_MAX} characters.`
    if (CONTROL_CHARACTER.test(name)) return "Plan name can't contain line breaks or tabs."
    if ([...description.trim()].length > PLAN_DESCRIPTION_MAX) return `Description can't be more than ${PLAN_DESCRIPTION_MAX} characters.`
    if (CONTROL_CHARACTER.test(description)) return "Description can't contain line breaks or tabs."
    return null
}

// Takes the trimmed name. Same checks and messages as workoutDayBody on the backend.
export function dayNameError(name: string): string | null
{
    if (!VISIBLE_CHARACTER.test(name)) return "Day name is required."
    if ([...name].length > DAY_NAME_MAX) return `Day name can't be more than ${DAY_NAME_MAX} characters.`
    if (CONTROL_CHARACTER.test(name)) return "Day name can't contain line breaks or tabs."
    return null
}
