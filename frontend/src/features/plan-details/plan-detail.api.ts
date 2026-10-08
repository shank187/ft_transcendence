import type {PlanDay, PlanDetail } from "./plan-detail.types";

// FAKE-DATA: every function in this file is a mock until the real
// /api/workout-plans/:planId endpoints exist. Data lives only in memory,
// so it resets to the seed below on every browser reload.
//
// FAKE-DATA: scenarios, chosen by the planId in /workouts/plans/:planId
//   any other id (e.g. "1", "2") -> Push / Pull / Legs, every mutation succeeds
//   "empty"   -> plan with no days
//   "missing" -> GET returns null, every mutation rejects "Plan not found"
//   "fail"    -> GET always rejects
//   "flaky"   -> Push / Pull / Legs, each create/rename/delete rejects on its
//                first attempt and succeeds when retried with the same input
// FAKE-DATA: name triggers, on any plan
//   create "fail"           -> always rejects
//   rename "fail" / "fail2" -> always rejects
//   plan rename "fail"      -> always rejects
// FAKE-DATA: a deleted plan stays deleted (GET returns null) until reload

const FAKE_DELAY_MS = 500
const MAX_DAYS = 7
const MAX_NAME_LENGTH = 30

// FAKE-DATA: the "database". One entry per planId, created on first use.
const plans = new Map<string, PlanDetail>()

// FAKE-DATA: remembers which "flaky" requests already failed once.
const flakyAttempts = new Set<string>()

// FAKE-DATA: planIds deleted with deletePlan().
const deletedPlans = new Set<string>()

// FAKE-DATA:
function wait() {
    return new Promise(resolve => setTimeout(resolve, FAKE_DELAY_MS))
}

// FAKE-DATA: returns the stored plan, seeding it the first time any
// function (GET or mutation) asks for this planId.
function findPlan(planId: string): PlanDetail | null {
    if (planId === "missing" || deletedPlans.has(planId)) return null

    let plan = plans.get(planId)
    if (!plan) {
        plan = {
            id: planId,
            name: "Push Pull Legs",
            description: "Hypertrophy split, 3 days per week",
            type: "CUSTOM",
            days: planId === "empty" ? [] : [
                { id: "push-day-1", name: "Push", dayOrder: 1, exerciseCount: 5, setCount: 18 },
                { id: "pull-day-2", name: "Pull", dayOrder: 2, exerciseCount: 5, setCount: 17 },
                { id: "legs-day-3", name: "Legs", dayOrder: 3, exerciseCount: 0, setCount: 0 },
            ],
        }
        plans.set(planId, plan)
    }
    return plan
}

// FAKE-DATA:
function findPlanOrThrow(planId: string): PlanDetail {
    const plan = findPlan(planId)
    if (!plan) throw new Error("Plan not found or unavailable")
    return plan
}

// FAKE-DATA: same rule as the form: trimmed, 1–30 characters.
function validName(name: string): string {
    const trimmed = name.trim()
    if (trimmed.length === 0 || trimmed.length > MAX_NAME_LENGTH)
        throw new Error(`Day name must be 1–${MAX_NAME_LENGTH} characters.`)
    return trimmed
}

// FAKE-DATA: on the "flaky" plan, the first attempt of each request fails.
function failFirstAttempt(planId: string, requestKey: string, message: string) {
    if (planId !== "flaky" || flakyAttempts.has(requestKey)) return
    flakyAttempts.add(requestKey)
    throw new Error(message)
}

// FAKE-DATA: PlanDay only holds strings and numbers, so a spread is a full
// copy. Callers get copies, never the stored objects.
function copyDay(day: PlanDay): PlanDay {
    return { ...day }
}

// FAKE-DATA:
function sortedDays(days: PlanDay[]): PlanDay[] {
    return [...days].sort((a, b) => a.dayOrder - b.dayOrder)
}

// FAKE-DATA: real version will be GET /api/workout-plans/:planId
export default async function getPlanDetails(planId: string): Promise<PlanDetail | null> {
    await wait()

    if (planId === "fail")
        throw new Error("Failed to load workout, try again")

    const plan = findPlan(planId)
    if (!plan) return null
    return { ...plan, days: sortedDays(plan.days).map(copyDay) }
}

// FAKE-DATA: real version will be POST /api/workout-plans/:planId/days
// The mock assigns the ID and dayOrder itself.
// still compiles; remove it once the caller stops passing it.
export async function createWorkoutDay(
    planId: string,
    name: string
    ): Promise<PlanDay> {
    await wait()

    const plan = findPlanOrThrow(planId)
    const dayName = validName(name)
    if (plan.days.length >= MAX_DAYS)
        throw new Error(`A plan can contain at most ${MAX_DAYS} days.`)
    if (dayName === "fail")
        throw new Error("Failed to create your day, try again.")
    failFirstAttempt(planId, `create:${dayName}`, "Failed to create your day, try again.")

    const newDay: PlanDay = {
        id: crypto.randomUUID(),
        name: dayName,
        dayOrder: Math.max(0, ...plan.days.map(day => day.dayOrder)) + 1,
        exerciseCount: 0,
        setCount: 0,
    }
    plans.set(planId, { ...plan, days: [...plan.days, newDay] })
    return copyDay(newDay)
}

// FAKE-DATA: real version will be PATCH /api/workout-plans/:planId/days/:dayId
export async function renameWorkoutDay(planId: string, dayId: string, name: string): Promise<PlanDay> {
    await wait()

    const plan = findPlanOrThrow(planId)
    const dayName = validName(name)
    const day = plan.days.find(d => d.id === dayId)
    if (!day) throw new Error("Day not found")
    if (dayName === "fail") throw new Error("Failed to rename your day, try again.")
    if (dayName === "fail2") throw new Error("another failure.")
    failFirstAttempt(planId, `rename:${dayId}:${dayName}`, "Failed to rename your day, try again.")

    // Only the name changes; id, dayOrder and counts are kept.
    const renamedDay: PlanDay = { ...day, name: dayName }
    plans.set(planId, { ...plan, days: plan.days.map(d => d.id === dayId ? renamedDay : d) })
    return copyDay(renamedDay)
}

// FAKE-DATA: proposed real version: DELETE /api/workout-plans/:planId/days/:dayId
// returning 200 with the remaining days, renumbered 1..n and sorted by dayOrder.
export async function deleteWorkoutDay(planId: string, dayId: string): Promise<PlanDay[]> {
    await wait()

    const plan = findPlanOrThrow(planId)
    if (!plan.days.some(d => d.id === dayId)) throw new Error("Day not found")
    failFirstAttempt(planId, `delete:${dayId}`, "Failed to delete your day, try again.")

    // Keep the old order, then give the remaining days 1, 2, 3...
    const remainingDays = sortedDays(plan.days)
        .filter(d => d.id !== dayId)
        .map((d, index) => ({ ...d, dayOrder: index + 1 }))
    plans.set(planId, { ...plan, days: remainingDays })
    return remainingDays.map(copyDay)
}

// FAKE-DATA: real version will be PATCH /api/workout-plans/:planId
export async function renamePlan(planId: string, name: string, description: string | null): Promise<PlanDetail> {
    await wait()

    const plan = findPlanOrThrow(planId)
    const planName = name.trim()
    if (planName.length === 0) throw new Error("Plan name is required.")
    if (planName === "fail") throw new Error("Failed to rename your plan, try again.")
    failFirstAttempt(planId, `rename-plan:${planName}`, "Failed to rename your plan, try again.")

    const renamedPlan: PlanDetail = { ...plan, name: planName, description: description?.trim() || null }
    plans.set(planId, renamedPlan)
    return { ...renamedPlan, days: sortedDays(renamedPlan.days).map(copyDay) }
}

// FAKE-DATA: real version will be DELETE /api/workout-plans/:planId
export async function deletePlan(planId: string): Promise<void> {
    await wait()

    findPlanOrThrow(planId)
    failFirstAttempt(planId, "delete-plan", "Failed to delete your plan, try again.")
    plans.delete(planId)
    deletedPlans.add(planId)
}
