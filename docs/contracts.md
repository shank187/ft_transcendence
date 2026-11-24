# Contracts between S2, S3 and S5

What each side can rely on. Written from the code on `main`; if the code and this file disagree, the code wins and this file gets fixed.

## S3 -> S5: workout results

### Weekly numbers: `getWorkoutStats`

```ts
// backend/src/modules/workout-sessions/workout-stats.ts
getWorkoutStats(userId: string, from: Date, to: Date): Promise<WorkoutStats>

type WorkoutStats = {
    workouts: number,
    sets: number,
    volumeKg: number,
    prs: number
}
```

It reads the user's workouts with `status = COMPLETED` and `from <= completedAt < to` (`from` included, `to` excluded). Workouts in progress and discarded workouts never count.

| Field | What it counts |
|---|---|
| `workouts` | Finished workouts in the range. |
| `sets` | Ticked sets (`completedAt` not null) in those workouts. Unticked sets are left out. |
| `volumeKg` | Sum of `weight × reps` over ticked sets that have both a weight and reps, in kg as stored. |
| `prs` | Ticked sets with `isPr = true` in those workouts. |

Each number is the sum of the per-workout `summary` (`toSummaryDto` in `workout-session.service.ts`): `setsCompleted`, `volumeKg` and `prSetIds.length`. The caller chooses `from` and `to`, so the caller decides where a week starts and ends.

Called by S5's `getWeeklyStats` (`progress.service.ts`) for `GET /api/progress/week`, with `from` = this Monday 00:00 UTC and `to` = the next Monday.

### Finish: `POST /api/workout-sessions/:sessionId/finish`

Response `200`, type `FinishWorkoutResponse` in `shared/workouts.d.ts`:

```ts
{
    session: WorkoutSession,      // the finished workout, status "COMPLETED", with its summary
    award: AwardResult | null,    // null when the workout was already finished
}
```

| Case | Answer |
|---|---|
| Workout in progress with at least one ticked set | `200`, `award` is the result of `award()` |
| Already finished (double click, retry, two finishes at once) | `200`, same finished `session`, `award: null`. No XP is paid twice. |
| No ticked set | `422` `"Complete at least one set to finish."` |
| Not found, or another user's workout | `404` `"Workout not found."` |
| Old row with status `CANCELLED` | `409` `"This workout was discarded."` |

Two finishes sent together: the second waits on the workout row lock (`lockOpenSession`) until the first commits, then returns the finished workout with `award: null`.

### PR rule

Decided once, inside the finish transaction, and stored on the set as `WorkoutSet.isPr`.

- Only exercises of type `WEIGHT_REPS`, `WEIGHTED_BODYWEIGHT` or `BODYWEIGHT_REPS` (`PR_EXERCISE_TYPES`).
- Only ticked sets with reps; `WEIGHT_REPS` and `WEIGHTED_BODYWEIGHT` sets also need a weight.
- Score (`prScore`): for `WEIGHT_REPS` and `WEIGHTED_BODYWEIGHT`, the estimated one-rep max, Epley formula: `weight × (1 + reps / 30)`; with 1 rep the score is the weight itself. For `BODYWEIGHT_REPS`, the reps: the body weight on the day of each workout is not recorded (`WorkoutSession.bodyWeightKg` is never written; `User.weightKg` is only the current profile value), so there is no load to estimate.
- `ASSISTED_BODYWEIGHT` has no PR: there, less weight is the better set, which needs its own rule.
- For each exercise, the best set of this workout (on a tie, the first one by exercise order, then set number) is a PR when its score is strictly higher than the best score in the user's other finished workouts.
- The first time an exercise is done is not a PR: there is nothing to beat.
- At most one PR set per exercise per workout.
- `isPr` is written at finish and never recomputed. Later workouts, edits or deletes do not change it.

Each PR set gives one `PR_SET` award event. The set ids are in `session.summary.prSetIds`.

### Discard: `DELETE /api/workout-sessions/:sessionId`

- Deletes the workout with its exercises and sets (cascade). The row is gone; `GET` on it then returns `404`.
- Only a workout in progress can be discarded: `204`. A finished one returns `409` and stays in the history. Not found or another user's: `404`.
- A discarded workout gives no XP and does not count in `getWorkoutStats`.
- `CANCELLED` is no longer written. Rows discarded before this change may still have it.

## S2 -> S3: current gym

### `User.currentGymId`

Nullable column on `User` (`backend/prisma/schema.prisma`), relation `currentGym`. `onDelete: SetNull`: deleting the gym clears it. S3 only reads it.

It is set with `PATCH /api/gyms/me/current` (`CurrentGymCOntroller` -> `selectCurrentGym` in `backend/src/modules/gyms/`):

| Body / case | Answer |
|---|---|
| `{ "gymId": "<id>" }`, gym can be selected | `200` `{ "message": "Gym selected successfully" }` |
| `{ "gymId": null }` | `200` `{ "message": "Gym reset successfully" }`, the user has no current gym |
| `gymId` missing or not a string | `400` `{ "message": "gymId is required" }` |
| Gym not found | `404` |
| Private gym created by another user | `403` |
| Public gym not verified, or closed | `422` |

### `GET /api/exercises?gym=true`

- Keeps only exercises whose equipment is all at the user's current gym. An exercise with no equipment also matches.
- The server reads the gym from `User.currentGymId`; the client never sends a gym id.
- With no current gym: `400` `"No current gym"`.
- Works together with `search`, `muscle`, `equipment`, `sort`, `page`, `limit`.

### `availableAtGym` on each exercise

On every item of `GET /api/exercises` (`ExerciseItem` in `shared/exercises.d.ts`), with or without `gym=true`:

- `null`: the user has no current gym.
- `true`: the current gym has all the exercise's equipment (or it needs none).
- `false`: the current gym lacks at least one piece of its equipment.

### `GET /api/exercises/filters`

```ts
{
    muscles: { id: string, name: string }[],
    equipment: { id: string, name: string }[],
    gym: { id: string, name: string } | null,   // the user's current gym
}
```

## S5 award

```ts
// backend/src/modules/progress/progress.service.ts
award(tx: Prisma.TransactionClient, userId: string, events: AwardEvent[])
    -> { xpGained: number, levelUp: boolean, unlocked: string[] }

type AwardEvent = {
    reason: "WORKOUT_COMPLETED" | "PR_SET";
    sourceId: string;   // workout id for WORKOUT_COMPLETED, set id for PR_SET
};
```

The return type is not written on the function; it matches `AwardResult` in `shared/workouts.d.ts`.

- Called by `finishWorkoutSession` inside the finish transaction, after the status and `isPr` are saved: one `WORKOUT_COMPLETED` event for the workout, plus one `PR_SET` event per PR set. If anything fails, nothing is saved.
- Locks the `User` row first, so two awards for the same user run one after the other.
- XP per event (`progress.rules.ts`): `XP_PER_WORKOUT = 100`, `XP_PER_PR = 50`. Each event is one `XpEvent` row; `@@unique([reason, sourceId])` means the same event is never paid twice.
- `xpGained`: XP of the events saved by this call.
- `levelUp`: the level after this call is higher than before. Level = `floor(totalXp / 500) + 1` (`getLevel`).
- `unlocked`: achievement codes unlocked by this call, empty when none: `WORKOUTS_1`, `WORKOUTS_10`, `WORKOUTS_50`, `WORKOUTS_100` (finished workouts), `EARLY_BIRD` (a workout finished from 05:00 to 08:59 UTC) and `NIGHT_OWL` (from 22:00 to 04:59 UTC).
