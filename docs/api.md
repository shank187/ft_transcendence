# API Contract

## Status rule

This file separates implemented endpoints from frozen target contracts. `backend/src/app.ts` and module route files are authoritative for what currently exists.

## Base path and transport

- API prefix: `/api`
- JSON request/response bodies
- External/browser traffic must use HTTPS in the validated deployment
- Credentials/cookies are sent only according to the shared auth configuration

## Implemented endpoint inventory — 30 September 2026

Source: `backend/src/app.ts` and module route files on `s3-api-endpoints`.

| Method | Path | Auth | Purpose |
|---|---|---:|---|
| POST | `/api/auth/register` | No | Create email/password account |
| POST | `/api/auth/login` | No | Authenticate |
| GET | `/api/auth/google` | No | Start Google OAuth (sets state cookie, redirects to Google) |
| GET | `/api/auth/google/callback` | No | Complete Google OAuth, set refresh cookie, redirect to `/onboarding` or `/home` |
| POST | `/api/auth/refresh` | Refresh cookie | Return a new access token |
| POST | `/api/auth/logout` | Refresh cookie | Revoke session and clear cookie |
| GET | `/api/auth/session` | Refresh cookie | Report `{ "authenticated": boolean }` |
| GET | `/api/users/me` | Yes | Return current user's `onboardingCompletedAt` |
| PATCH | `/api/users/onboarding` | Yes | Save onboarding fields |
| GET | `/api/exercises` | Yes | Return paginated canonical exercises |
| GET | `/api/exercises/filters` | Yes | Return the muscle groups and equipment that at least one exercise uses |
| GET | `/api/equipment` | Yes | Return every equipment item with its category |
| GET | `/api/workout-plans` | Yes | List the authenticated user's own workout plans |
| POST | `/api/workout-plans` | Yes | Create a custom plan |
| GET | `/api/workout-plans/:planId` | Yes | Return one owned plan with its days |
| PATCH | `/api/workout-plans/:planId` | Yes | Update an owned plan's name and description |
| DELETE | `/api/workout-plans/:planId` | Yes | Delete an owned plan with its days |
| POST | `/api/workout-plans/:planId/days` | Yes | Add a day at the end of an owned plan |
| GET | `/api/workout-plans/:planId/days/:dayId` | Yes | Return one day of an owned plan with its exercises and sets |
| PATCH | `/api/workout-plans/:planId/days/:dayId` | Yes | Rename a day of an owned plan |
| DELETE | `/api/workout-plans/:planId/days/:dayId` | Yes | Delete a day and renumber the remaining days |
| PUT | `/api/workout-plans/:planId/days/:dayId/exercises` | Yes | Replace a day's planned exercises and sets |
| GET | `/api/workout-sessions/:sessionId` | Yes | Return one owned workout with its exercises and sets |
| PATCH | `/api/workout-sessions/:sessionId` | Yes | Discard a workout in progress |
| POST | `/api/workout-sessions/:sessionId/exercises` | Yes | Add exercises to a workout in progress |
| POST | `/api/workout-sessions/:sessionId/exercises/:exerciseId/sets` | Yes | Add a set to an exercise of a workout in progress |
| PATCH | `/api/workout-sessions/:sessionId/sets/:setId` | Yes | Update or tick a set of a workout in progress |
| DELETE | `/api/workout-sessions/:sessionId/sets/:setId` | Yes | Delete a set and renumber the remaining sets |

"Auth: Yes" means `Authorization: Bearer <access token>` checked by `backend/src/middleware/authenticate.ts`, which sets `req.userId`.

Do not document gym, progress, social, chat, or workout write/session endpoints as implemented until their routes are merged.

## Request flow

```text
React action
  → configured API client
  → Express route
  → authentication middleware when protected
  → controller parses request
  → service applies business/ownership rules
  → Prisma query/transaction
  → intentional JSON response
  → UI loading/error/empty/success state
```

## Authentication and ownership

- Protected endpoints derive identity from verified authentication state.
- The browser must not choose `userId` for owned resources.
- Checking authentication is not enough: the service must verify that the authenticated user owns the requested plan/session/resource.
- Frontend route protection improves UX; backend authorization provides security.

## Validation

- Frontend validation gives immediate feedback.
- Backend runtime validation is authoritative.
- Reject malformed path, query, and body inputs deliberately.
- TypeScript types do not validate network input.
- Query parameters that expect a single value must reject unexpected repeated/array shapes when ambiguity affects behavior.

## Error contract

S1 must finalize one consistent error DTO. Until then, do not invent a second per-feature shape.

Current state (not yet consistent): `authenticate`, users, and workout-plans return `{ "message": "..." }`; auth refresh/logout/session/Google return `{ "error": "..." }`. Clients should not depend on either shape beyond the status code until S1 unifies them.

The intended minimum is:

```json
{
  "error": {
    "code": "STABLE_MACHINE_CODE",
    "message": "Safe user-facing message",
    "details": {}
  }
}
```

`details` is optional and must not expose stack traces, SQL, tokens, hashes, or internal secrets.

Use intentional status codes:

- `200` successful read/update
- `201` resource created
- `204` successful action with no response body
- `400` malformed input
- `401` unauthenticated/invalid session
- `403` authenticated but forbidden
- `404` resource not found or intentionally hidden
- `409` lifecycle/uniqueness conflict
- `500` unexpected safe server error

## Exercise catalog

- **Code:** `backend/src/modules/exercises/exercise.route.ts` → `exercise.controller.ts` (zod `exerciseListQuery` from `exercise.schema.ts`) → `exercise.service.ts`.
- `Equipment` is S2's table; these endpoints only read it.

### `GET /api/exercises`

Lists canonical exercises, paginated and optionally filtered.

- **Auth:** required (Bearer access token).
- **Ordering:** by `name`, ascending by default or descending with `sort=name_desc`; `id` ascending breaks ties, so a row never appears on two pages.

Query parameters, all optional:

| Param | Type | Default | Rules |
|---|---|---|---|
| `page` | integer | `1` | Digits only (`0-9`), at least `1` |
| `limit` | integer | `12` | Digits only (`0-9`), from `1` to `50` |
| `search` | text | none | Trimmed; case-insensitive "contains" match on `name`. Empty or whitespace-only means no filter |
| `muscle` | `MuscleGroup.id` | none | Matches the **primary** muscle only; secondary muscles are ignored. Trimmed; empty means no filter |
| `equipment` | `Equipment.id` | none | Matches exercises linked to this equipment. Trimmed; empty means no filter |
| `sort` | `name_asc` \| `name_desc` | `name_asc` | Exactly one of the two values; unlike the filters, empty is not accepted |

Filters combine with AND. Pagination applies to the filtered result, and `total` counts the filtered rows. A `page` past `totalPages` returns `200` with an empty `items` array.

Example: `GET /api/exercises?search=press&muscle=<muscleGroupId>&page=1&limit=12`

Response `200`:

```json
{
  "items": [
    {
      "id": "9b1e4c2a-3d5f-4a6b-8c7d-0e1f2a3b4c5d",
      "name": "Bench Press",
      "type": "WEIGHT_REPS",
      "primaryMuscle": "Chest",
      "secondaryMuscles": ["Triceps", "Shoulders"],
      "equipment": ["Barbell", "Bench"],
      "description": null,
      "imageUrl": null
    }
  ],
  "page": 1,
  "limit": 12,
  "total": 1,
  "totalPages": 1
}
```

| Field | Type | Notes |
|---|---|---|
| `items[].id` | string (UUID) | `Exercise.id` |
| `items[].name` | string | |
| `items[].type` | `ExerciseType` | `WEIGHT_REPS`, `BODYWEIGHT_REPS`, `WEIGHTED_BODYWEIGHT`, `ASSISTED_BODYWEIGHT`, `DURATION`, `WEIGHT_DURATION`, `DISTANCE_DURATION` |
| `items[].primaryMuscle` | string | Name of the primary `MuscleGroup` |
| `items[].secondaryMuscles` | string[] | Names of the secondary muscle groups; order not guaranteed |
| `items[].equipment` | string[] | Names of the linked equipment; order not guaranteed |
| `items[].description` | string \| null | |
| `items[].imageUrl` | string \| null | |
| `page` | number | Requested page |
| `limit` | number | Requested page size |
| `total` | number | Exercises matching the filters |
| `totalPages` | number | `ceil(total / limit)`; `0` when nothing matches |

Status codes:

- `200` page returned (possibly with `items: []`)
- `400` `{ "message": "..." }`, see below
- `401` missing, invalid, or expired access token
- `500` `{ "message": "Internal server error" }` when the database fails; the error is logged on the server

`400` messages:

| Cause | `message` |
|---|---|
| Repeated `muscle` key, e.g. `?muscle=a&muscle=b` (Express turns it into an array) | `Invalid Muscle` |
| Repeated `search` key | `Invalid Search` |
| `search` longer than 100 characters after trimming, or containing a control character (NUL, line break, tab) | `Invalid Search` |
| `muscle` / `equipment` not a UUID | `Invalid Muscle` / `Invalid Equipment` |
| Repeated `equipment` key | `Invalid Equipment` |
| Repeated `page` key | `Invalid Page` |
| Repeated `limit` key | `Invalid Limit` |
| `page`/`limit` not plain digits or out of range, e.g. `page=0`, `page=abc`, `page=`, `page=1.5`, `page=1e2`, `page=-1`, `page=+1`, `page=0x10`, `limit=51` | `Invalid Pagination` |
| `page` above `Number.MAX_SAFE_INTEGER` | `Invalid Pagination` |
| `sort` not `name_asc` or `name_desc` (including empty), or a repeated `sort` key | `Invalid Sort` |
| `muscle` is not an existing `MuscleGroup.id` | `Invalid Muscle` |
| `equipment` is not an existing `Equipment.id` | `Invalid Equipment` |

### `GET /api/exercises/filters`

Returns the options for the catalog's muscle and equipment filters.

- **Auth:** required (Bearer access token).
- **Request:** no path, query, or body parameters.
- **Rows:** only muscle groups used as the primary muscle of at least one exercise, and only equipment linked to at least one exercise.
- **Ordering:** each list by `name` ascending.

Response `200`:

```json
{
  "muscles": [
    { "id": "1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d", "name": "Chest" }
  ],
  "equipment": [
    { "id": "6f5e4d3c-2b1a-4c9d-8e7f-a0b1c2d3e4f5", "name": "Barbell" }
  ]
}
```

The `id` values are the ones `GET /api/exercises` accepts in `muscle` and `equipment`.

Status codes:

- `200` lists returned (possibly empty)
- `401` missing, invalid, or expired access token
- `500` `{ "message": "Internal server error" }` when the database fails; the error is logged on the server

Required validation hardening before final QA:

- initial failure can retry without reload;
- later-page failure retains loaded cards and retries the failed page;
- overlapping/repeated requests cannot duplicate/corrupt results;
- final-page controls are deliberate.

### `GET /api/equipment`

Returns every equipment item in the catalog with its category, including equipment no exercise uses yet (unlike `GET /api/exercises/filters`).

- **Auth:** required (Bearer access token).
- **Request:** no path, query, or body parameters.
- **Ordering:** by `category` in the order of the `EquipmentCategory` enum (`FREE_WEIGHTS`, `BENCHES_RACKS`, `MACHINES`, `CABLES_ATTACHMENTS`, `CARDIO`, `ACCESSORIES`, `OTHER`; PostgreSQL sorts an enum by its declared order, not alphabetically), then by `name` ascending.
- **Code:** `getEquipmentController` → `getEquipment` in `backend/src/modules/equipment/`.

Response `200` — `EquipmentItem[]` (possibly `[]`):

```json
[
  { "id": "6f5e4d3c-2b1a-4c9d-8e7f-a0b1c2d3e4f5", "name": "Adjustable Dumbbells", "category": "FREE_WEIGHTS" },
  { "id": "7a6b5c4d-3e2f-4a1b-9c8d-e7f6a5b4c3d2", "name": "Adjustable Bench", "category": "BENCHES_RACKS" }
]
```

| Field | Type | Notes |
|---|---|---|
| `id` | string (UUID) | `Equipment.id`, the value `GET /api/exercises` accepts in `equipment` |
| `name` | string | Unique |
| `category` | `EquipmentCategory` | One of the seven values above |

Status codes:

- `200` list returned
- `401` missing, invalid, or expired access token
- `500` `{ "message": "Internal server error" }` when the database fails; the error is logged on the server

Failure example: a request without an access token returns `401`.

Type: `EquipmentItem` and `EquipmentCategory` in `shared/equipment.d.ts`, read by both the backend and the frontend.

## Workout plans

### Limits

Every limit is checked on both sides with the same message: the frontend for fast feedback, the backend because anyone can call the API directly. Change both places together.

| Limit | Value | Backend | Frontend (`frontend/src/features/workouts/shared/limits.ts`) | Error |
|---|---|---|---|---|
| Plan name | 1–50 characters, trimmed | `workoutPlanBody` | `PLAN_NAME_MAX` | `400` |
| Plan description | at most 200 characters, trimmed | `workoutPlanBody` | `PLAN_DESCRIPTION_MAX` | `400` |
| Plans per user | 3 | `MAX_PLANS_PER_USER` | `MAX_PLANS_PER_USER` | `422` "You can have at most 3 plans." |
| Day name | 1–30 characters, trimmed | `workoutDayBody` | `DAY_NAME_MAX` | `400` |
| Days per plan | 7 | `MAX_DAYS_PER_PLAN` | `MAX_DAYS_PER_PLAN` | `422` "A plan can have at most 7 days." |
| Exercises per workout | 20 | `MAX_EXERCISES` | `MAX_EXERCISES` | `422` "A workout can have at most 20 exercises." |
| Exercises per day (day editor) | 20 | `MAX_EXERCISES` in `saveDayBody` | `MAX_EXERCISES` | `400` "A day can have at most 20 exercises." |
| Sets per exercise | 20 | `MAX_SETS_PER_EXERCISE` | `MAX_SETS_PER_EXERCISE` | `422` "An exercise can have at most 20 sets." |
| Set weight | 0–1000, at most 2 decimals | `weightValue` | `set-values.ts` | `400` "Weight must be between 0 and 1000 kg." |
| Set reps | whole number 1–999 | `repsValue` | `set-values.ts` | `400` "Reps must be a whole number between 1 and 999." |
| Set time | whole seconds 1–86400 | `durationValue` | `set-values.ts` | `400` "Time must be a whole number of seconds, 1 to 86400." |
| Set distance | more than 0, at most 1000000, 1 decimal | `distanceValue` | `set-values.ts` | `400` "Distance must be between 0 and 1000000 m." |
| Set type | `NORMAL`, `HEAVY`, `WARMUP`, `DROP`, `FAILURE` | `setTypeValue` | `SET_TYPES` | `400` "Invalid set type." |
| Rest (day editor) | whole seconds 0–3600, `null` = no timer | `restSecondsValue` | `validateRest` | `400` "Rest must be between 0 and 3600 seconds." |
| Exercise search | at most 100 characters, trimmed, no control characters | `exercise.schema.ts` | `EXERCISE_SEARCH_MAX` (search box `maxLength`) | `400` "Invalid Search" |
| Text (plan name, description, day name) | one line: no control characters (NUL, line breaks, tabs) | `CONTROL_CHARACTER` refine | `CONTROL_CHARACTER` | `400` e.g. "Plan name can't contain line breaks or tabs." |
| Names (plan, day) | at least one visible character (letter, number, punctuation or symbol; emoji are fine) | `VISIBLE_CHARACTER` refine | `VISIBLE_CHARACTER` | `400` "Plan name is required." / "Day name is required." |
| Ids in the URL (`:planId`, `:dayId`, `:sessionId`, `:exerciseId`, `:setId`) | UUID | `idParam` (`z.uuid()`) in the controllers | — | `404` with the route's normal message, e.g. "Plan not found." |
| `exerciseIds` items, `muscle`, `equipment` | UUID | `addExercisesBody`, `exercise.schema.ts` | — | `400` "Exercise not found." / "Invalid Muscle" / "Invalid Equipment" |

Backend files: a rule more than one module uses (ids, text rules, exercises per day and workout, sets per exercise, set types, set values, rest) is in `backend/src/lib/validation.ts`; a rule only one module uses stays in its schema: plans and days in `backend/src/modules/workouts/workout.schema.ts`, workout bodies in `backend/src/modules/workout-sessions/workout-session.schema.ts`, search in `backend/src/modules/exercises/exercise.schema.ts`. When the frontend is at a count limit it hides the add button and shows the same message.

Lengths count characters, not UTF-16 units: an emoji counts as one on both sides (`[...text].length` on the frontend, zod on the backend). Text is stored as typed, not HTML-escaped: React escapes it when it renders and Prisma sends every value as a query parameter, so `<script>` in a name is plain text. Control characters are rejected because PostgreSQL refuses NUL in text (it used to give a 500) and none belong in a one-line name.

### `GET /api/workout-plans`

Lists the plans owned by the authenticated user. Used by the `/workouts` page (`frontend/src/features/workouts/plans/plans.api.ts`).

- **Auth:** required (Bearer access token).
- **Request:** no path, query, or body parameters. Pagination is not implemented.
- **Ownership:** the service filters `WorkoutPlan.userId = req.userId`. The browser never sends a user ID. Plans with `userId = null` are not returned. The schema only makes `userId` nullable; that `CUSTOM` plans belong to a user is a service/business rule, not a database constraint.
- **Ordering:** `name` ascending.
- **Code:** `backend/src/modules/workouts/workout.route.ts` → `workout.controller.ts` → `workout.service.ts`.

Response `200` — array, empty when the user has no plans:

```json
[
  {
    "id": "3f1c2b8e-7d4a-4c1e-9b2f-5a6d7e8f9a0b",
    "name": "Push Pull Legs",
    "description": null,
    "type": "CUSTOM",
    "days": 3
  }
]
```

| Field | Type | Notes |
|---|---|---|
| `id` | string (UUID) | `WorkoutPlan.id` |
| `name` | string | |
| `description` | string \| null | Optional in the schema |
| `type` | `"CUSTOM"` \| `"RECOMMENDED"` | `WorkoutPlanType`; schema default `CUSTOM` |
| `days` | number | Count of `WorkoutDay` rows, not the day objects |

Status codes:

- `200` list returned (possibly `[]`)
- `401` missing, invalid, or expired access token — e.g. no `Authorization` header returns `{ "message": "Access token is required" }`
- `500` unexpected server/database error — `{ "message": "Internal server error" }`

Frontend type: `WorkoutPlan` in `frontend/src/features/workouts/plans/plans.types.ts` must stay in sync with this DTO.

### `POST /api/workout-plans`

Creates a custom plan for the authenticated user. Used by the create plan dialog (`postWorkoutPlan` in `frontend/src/features/workouts/plans/plans.api.ts`).

- **Auth:** required (Bearer access token).
- **Body:** `{ "name": string, "description"?: string | null }`. Both are trimmed. `name` 1–50 characters; `description` at most 200 characters. Unknown fields (including `type`) are dropped; `type` is always `CUSTOM`.
- **Limit:** at most 3 plans per user (`MAX_PLANS_PER_USER` in `workout.schema.ts`).
- **Ownership:** `userId` is taken from the token, never from the body.
- **Code:** `createWorkoutPlanController` → `createWorkoutPlan`; limits in `workout.schema.ts` (`workoutPlanBody`).

Response `201` — the new plan, same DTO as one item of `GET /api/workout-plans` (`days` is `0`):

```json
{
  "id": "3f1c2b8e-7d4a-4c1e-9b2f-5a6d7e8f9a0b",
  "name": "Push Pull Legs",
  "description": null,
  "type": "CUSTOM",
  "days": 0
}
```

Status codes:

- `201` plan created
- `400` body fails validation — `{ "message": "<first validation error>" }`
- `422` `{ "message": "You can have at most 3 plans." }`
- `401` missing, invalid, or expired access token
- `500` unexpected error — `{ "message": "Internal server error" }`

Failure example: `{ "name": "   " }` returns `400` `{ "message": "Plan name is required." }`.

### `GET /api/workout-plans/:planId`

Returns one plan with its days. Used by the plan detail page and the day editor (`getPlanDetails` in `frontend/src/features/workouts/shared/get-plan-details.ts`).

- **Auth:** required (Bearer access token).
- **Path:** `planId` — the plan's id. No query or body.
- **Ownership:** the service looks the plan up with `id = planId` and `userId = req.userId`. A plan that does not exist and a plan owned by someone else both return `404`, so the client cannot tell them apart.
- **Ordering:** `days` by `dayOrder` ascending.
- **Code:** `getWorkoutPlanController` → `getWorkoutPlan`.

Response `200`:

```json
{
  "id": "3f1c2b8e-7d4a-4c1e-9b2f-5a6d7e8f9a0b",
  "name": "Push Pull Legs",
  "description": null,
  "type": "CUSTOM",
  "days": [
    { "id": "a1b2c3d4-0000-4000-8000-000000000001", "name": "Push", "dayOrder": 1, "exerciseCount": 4, "setCount": 12 }
  ]
}
```

| Field | Type | Notes |
|---|---|---|
| `id`, `name`, `description`, `type` | | Same as the list DTO |
| `days` | `PlanDay[]` | The plan's days, possibly `[]` |
| `days[].id` | string (UUID) | `WorkoutDay.id` |
| `days[].name` | string | |
| `days[].dayOrder` | number | 1..n, unique inside the plan |
| `days[].exerciseCount` | number | Count of `WorkoutExercise` rows of the day |
| `days[].setCount` | number | Total planned sets across those exercises |

Status codes:

- `200` plan returned
- `401` missing, invalid, or expired access token
- `404` `{ "message": "Plan not found." }`
- `500` unexpected error — `{ "message": "Internal server error" }`

Failure example: another user's `planId` returns `404` `{ "message": "Plan not found." }`.

Frontend types: `PlanDetail` and `PlanDay` in `frontend/src/features/workouts/shared/workouts.types.ts` must stay in sync with this DTO.

### `PATCH /api/workout-plans/:planId`

Updates a plan's name and description. Used by the rename plan dialog (`renamePlan` in `plan-details/plan-details.api.ts`), which sends both fields every time.

- **Auth:** required (Bearer access token).
- **Path:** `planId`.
- **Body:** same as `POST /api/workout-plans`: `name` 1–50 characters (required), `description` at most 200 characters. `description: null` clears it; leaving `description` out keeps the current value.
- **Ownership:** the update only matches `id = planId` and `userId = req.userId`.
- **Code:** `updateWorkoutPlanController` → `updateWorkoutPlan`.

Response `200` — the updated plan, same DTO as `GET /api/workout-plans/:planId`.

Status codes:

- `200` plan updated
- `400` body fails validation — `{ "message": "<first validation error>" }`
- `401` missing, invalid, or expired access token
- `404` `{ "message": "Plan not found." }` (also when the plan is deleted while the request runs)
- `500` unexpected error — `{ "message": "Internal server error" }`

Failure example: a 51-character `name` returns `400` `{ "message": "Plan name can't be more than 50 characters." }`.

### `DELETE /api/workout-plans/:planId`

Deletes a plan. Used by the delete plan dialog (`deletePlan` in `plan-details/plan-details.api.ts`).

- **Auth:** required (Bearer access token).
- **Path:** `planId`. No body.
- **Ownership:** the delete only matches `id = planId` and `userId = req.userId`.
- **Effects:** the plan's days and their planned exercises are deleted with it (Cascade). Past workout sessions stay in the history with no day (SetNull).
- **Code:** `deleteWorkoutPlanController` → `deleteWorkoutPlan`.

Response `204` — no body.

Status codes:

- `204` plan deleted
- `401` missing, invalid, or expired access token
- `404` `{ "message": "Plan not found." }` (also when the plan was already deleted)
- `500` unexpected error — `{ "message": "Internal server error" }`

Failure example: deleting the same plan twice returns `404` `{ "message": "Plan not found." }` the second time.

### `POST /api/workout-plans/:planId/days`

Adds a day at the end of a plan. Used by the add day form (`createWorkoutDay` in `plan-details/plan-details.api.ts`).

- **Auth:** required (Bearer access token).
- **Path:** `planId`.
- **Body:** `{ "name": string }`, trimmed, 1–30 characters. The server picks `id` and `dayOrder` (last `dayOrder` + 1).
- **Limit:** at most 7 days per plan (`MAX_DAYS_PER_PLAN` in `workout.schema.ts`).
- **Ownership:** the plan must have `id = planId` and `userId = req.userId`.
- **Code:** `createWorkoutDayController` → `createWorkoutDay`; limits in `workout.schema.ts` (`workoutDayBody`).

Response `201` — the new day, one `PlanDay` (counts are `0`):

```json
{ "id": "a1b2c3d4-0000-4000-8000-000000000004", "name": "Legs", "dayOrder": 4, "exerciseCount": 0, "setCount": 0 }
```

Status codes:

- `201` day created
- `400` body fails validation — `{ "message": "<first validation error>" }`
- `401` missing, invalid, or expired access token
- `404` `{ "message": "Plan not found." }`
- `409` `{ "message": "The plan changed. Please try again." }` — another request took the same `dayOrder` at the same time
- `422` `{ "message": "A plan can have at most 7 days." }`
- `500` unexpected error — `{ "message": "Internal server error" }`

Failure example: adding an 8th day returns `422` `{ "message": "A plan can have at most 7 days." }`.

### `GET /api/workout-plans/:planId/days/:dayId`

Returns one day with its planned exercises and sets. Used by the day editor and by starting a workout from a day (`getWorkoutDay` in `day-editor/day-editor.api.ts`).

- **Auth:** required (Bearer access token).
- **Path:** `planId`, `dayId`. No query or body.
- **Ownership:** the day is looked up with `id = dayId` inside a plan with `id = planId` and `userId = req.userId`. A missing day, a day of another plan, and a plan owned by someone else all return `404`.
- **Ordering:** `exercises` by `order` ascending; each exercise's `sets` by `setNumber` ascending.
- **Code:** `getWorkoutDayController` → `getWorkoutDay`; exercise fields from `exercise-summary.ts`.

Response `200`:

```json
{
  "id": "a1b2c3d4-0000-4000-8000-000000000001",
  "name": "Push",
  "dayOrder": 1,
  "planId": "3f1c2b8e-7d4a-4c1e-9b2f-5a6d7e8f9a0b",
  "planName": "Push Pull Legs",
  "exercises": [
    {
      "id": "b2c3d4e5-0000-4000-8000-000000000001",
      "order": 1,
      "restSeconds": 90,
      "exerciseSummary": { "id": "c3d4e5f6-0000-4000-8000-000000000001", "name": "Bench Press", "type": "WEIGHT_REPS", "primaryMuscle": "Chest", "imageUrl": null },
      "sets": [
        { "id": "d4e5f6a7-0000-4000-8000-000000000001", "setNumber": 1, "setType": "NORMAL", "targetWeight": 60, "targetReps": 8, "targetDuration": null, "targetDistance": null }
      ]
    }
  ]
}
```

| Field | Type | Notes |
|---|---|---|
| `id`, `name`, `dayOrder` | | `WorkoutDay` |
| `planId`, `planName` | string | The parent `WorkoutPlan` |
| `exercises[].id` | string (UUID) | `WorkoutExercise.id` |
| `exercises[].order` | number | 1..n inside the day |
| `exercises[].restSeconds` | number \| null | `null` = no rest timer |
| `exercises[].exerciseSummary` | object | `id`, `name`, `type` (`ExerciseType`), `primaryMuscle` (muscle group name), `imageUrl` |
| `exercises[].sets[]` | `PlannedSet` | `id`, `setNumber`, `setType`, `targetWeight`, `targetReps`, `targetDuration`, `targetDistance` (targets nullable) |

Status codes:

- `200` day returned
- `401` missing, invalid, or expired access token
- `404` `{ "message": "Day not found." }`
- `500` unexpected error — `{ "message": "Internal server error" }`

Failure example: a `dayId` from another user's plan returns `404` `{ "message": "Day not found." }`.

Types: `DayDetail`, `DayExercise` and `PlannedSet` in `shared/workouts.d.ts`, `ExerciseSummary` in `shared/exercises.d.ts`, read by both the backend and the frontend.

### `PATCH /api/workout-plans/:planId/days/:dayId`

Renames one day. Used by the rename day dialog (`renameWorkoutDay` in `plan-details/plan-details.api.ts`).

- **Auth:** required (Bearer access token).
- **Path:** `planId`, `dayId`.
- **Body:** `{ "name": string }`, trimmed, 1–30 characters.
- **Ownership:** the update only matches a day with `id = dayId` whose plan has `id = planId` and `userId = req.userId`.
- **Code:** `renameWorkoutDayController` → `renameWorkoutDay`.

Response `200` — the renamed day, one `PlanDay`.

Status codes:

- `200` day renamed
- `400` body fails validation — `{ "message": "<first validation error>" }`
- `401` missing, invalid, or expired access token
- `404` `{ "message": "Day not found." }` — the day does not exist, belongs to another plan, or the plan is not the user's
- `500` unexpected error — `{ "message": "Internal server error" }`

Failure example: `{ "name": "" }` returns `400` `{ "message": "Day name is required." }`.

### `DELETE /api/workout-plans/:planId/days/:dayId`

Deletes one day and renumbers the remaining days 1..n in one transaction. Used by the delete day dialog (`deleteWorkoutDay` in `plan-details/plan-details.api.ts`).

- **Auth:** required (Bearer access token).
- **Path:** `planId`, `dayId`. No body.
- **Ownership:** same rule as renaming a day.
- **Effects:** the day's planned exercises are deleted with it (Cascade). Past sessions of that day stay in the history with no day (SetNull). If any step fails, nothing is deleted.
- **Code:** `deleteWorkoutDayController` → `deleteWorkoutDay`.

Response `200` — the remaining days, `PlanDay[]` sorted by `dayOrder` (possibly `[]`):

```json
[
  { "id": "a1b2c3d4-0000-4000-8000-000000000001", "name": "Push", "dayOrder": 1, "exerciseCount": 4, "setCount": 12 },
  { "id": "a1b2c3d4-0000-4000-8000-000000000003", "name": "Legs", "dayOrder": 2, "exerciseCount": 5, "setCount": 15 }
]
```

Status codes:

- `200` day deleted, remaining days returned
- `401` missing, invalid, or expired access token
- `404` `{ "message": "Day not found." }` (also when the day was already deleted)
- `409` `{ "message": "The plan changed. Please try again." }` — another request changed the day numbers at the same time
- `500` unexpected error — `{ "message": "Internal server error" }`

Failure example: deleting a day of another user's plan returns `404` `{ "message": "Day not found." }`.

### `PUT /api/workout-plans/:planId/days/:dayId/exercises`

Replaces all of a day's planned exercises and sets with the body: the day editor's Save (`saveWorkoutDay` in `day-editor/day-editor.api.ts`).

- **Auth:** required (Bearer access token).
- **Path:** `planId`, `dayId`.
- **Body:** `SaveDayBody`. Array position is the order: exercise `i` gets `order` `i + 1`, set `j` gets `setNumber` `j + 1`. The client never sends `order`, `setNumber` or row ids; unknown keys are dropped. `exercises: []` clears the day. The same exercise may appear more than once.

```json
{
  "exercises": [
    {
      "exerciseId": "c3d4e5f6-0000-4000-8000-000000000001",
      "restSeconds": 90,
      "sets": [
        { "setType": "WARMUP", "targetWeight": 40, "targetReps": 8, "targetDuration": null, "targetDistance": null },
        { "setType": "NORMAL", "targetWeight": 60, "targetReps": 8, "targetDuration": null, "targetDistance": null }
      ]
    }
  ]
}
```

| Field | Type | Limits |
|---|---|---|
| `exercises` | array | at most 20 (`MAX_EXERCISES`) |
| `exercises[].exerciseId` | string (UUID) | must exist in the exercise catalog |
| `exercises[].restSeconds` | integer \| null | 0–3600; `null` = no rest timer |
| `exercises[].sets` | array | at most 20 per exercise (`MAX_SETS_PER_EXERCISE`) |
| `sets[].setType` | `"NORMAL"` \| `"HEAVY"` \| `"WARMUP"` \| `"DROP"` \| `"FAILURE"` | |
| `sets[].targetWeight`, `targetReps`, `targetDuration`, `targetDistance` | number \| null | same limits as a workout set (see Limits); `null` = no target, never `0` |

- **Ownership:** same rule as reading a day. The exercises are a shared catalog, so they only need to exist.
- **Effects:** in one transaction, the day's planned exercises are deleted (their sets with them, Cascade) and the body's exercises and sets are created. The day keeps its `id`, `name` and `dayOrder`. Past sessions are not touched: they copied their values. If any step fails, the day keeps its old exercises.
- **Code:** `putWorkoutDayController` → `replaceWorkoutDay`; body rules in `workout.schema.ts` (`saveDayBody`) and `backend/src/lib/validation.ts`.

Response `200` — the saved day, read back inside the transaction, same shape as `GET /api/workout-plans/:planId/days/:dayId` (`DayDetail`, new row ids).

Status codes:

- `200` day saved, fresh day returned
- `400` body fails validation — `{ "message": "<first validation error>" }`
- `401` missing, invalid, or expired access token
- `404` `{ "message": "Day not found." }` — the day does not exist, belongs to another plan, the plan is not the user's, or the day was deleted during the save
- `404` `{ "message": "Exercise not found." }` — an `exerciseId` is not in the catalog
- `409` `{ "message": "The day changed. Please try again." }` — another save of the same day ran at the same time
- `500` unexpected error — `{ "message": "Internal server error" }`

Failure example: a set with `"setType": "BANANA"` returns `400` `{ "message": "Invalid set type." }`.

## Workout sessions

Routes under `/api/workout-sessions`, code in `backend/src/modules/workout-sessions/`. Frontend calls in `frontend/src/features/workouts/workout-session/workout-session.api.ts` and `frontend/src/features/workouts/shared/start-workout.ts`.

Rules shared by every route below:

- **Auth:** required (Bearer access token).
- **Ownership:** the session is looked up with `id = sessionId` and `userId = req.userId`. A missing session and another user's session both return `404 { "message": "Workout not found." }`.
- **Ids:** every id in the URL must be a UUID; anything else returns the same `404` as a missing row (`"Workout not found."`, `"Exercise not found."`, `"Set not found."`).
- **Closed workouts:** every write first checks the session's status. A `COMPLETED` or `CANCELLED` session returns `409 { "message": "This workout is finished or cancelled." }`. The write itself also requires `status = IN_PROGRESS` in its `where`, so a workout finished between the check and the write is never changed (that case answers `404 "Workout not found."`).
- **Errors:** `400` returns the first validation message; unexpected errors return `500 { "message": "Internal server error" }`.

### `POST /api/workout-sessions`

Starts a workout, empty or from one of the user's plan days.

- **Body:** `{}` for an empty workout, or `{ "dayId": "<uuid>" }` to start from that day.
- **From a day:** the day's exercises and sets are copied in one transaction. `order`, `restSeconds`, `setNumber` and `setType` are copied as they are; `target*` values become `planned*`. Later edits to the plan never change the workout.
- **One active workout:** a user with a workout `IN_PROGRESS` gets `409` with that workout's id, so the client can offer to resume or discard it.
- **Daily limit:** at most 5 workouts started in the last 24 hours (`MAX_WORKOUTS_PER_DAY` in `workout-session.schema.ts`). Discarded workouts count too, so start and discard can't be repeated without end.
- **Starts at the same moment:** the checks and the insert run in one `Serializable` transaction. When two starts overlap, PostgreSQL rolls one back, and that request answers `409` without an id. Tested with 10 starts sent together: one workout saved, nine `409`.
- **Code:** `startWorkoutSessionController` → `startWorkoutSession`.

Response `201`: the new workout, same shape as `GET /api/workout-sessions/:sessionId`. An empty workout has `"name": "Workout"`, `"workoutDayId": null` and `"exercises": []`.

Status codes:

- `201` workout started
- `400` body is not an object, or `dayId` is not a UUID (`{ "message": "Day not found." }`)
- `401` missing, invalid, or expired access token
- `404` `{ "message": "Day not found." }` — the day doesn't exist or isn't in one of the user's plans
- `409` `{ "message": "You have a workout in progress.", "activeSessionId": "<uuid>" }`, or `{ "message": "Another workout was started at the same time. Please try again." }`
- `422` `{ "message": "You can start at most 5 workouts in 24 hours." }`
- `500` unexpected error

Failure example: starting a second workout while one is running returns `409` with the running workout's `activeSessionId`.

### `GET /api/workout-sessions/:sessionId`

Returns one workout with its exercises and sets.

- **Path:** `sessionId`. No query or body.
- **Ordering:** `exercises` by `order` ascending; each exercise's `sets` by `setNumber` ascending.
- **Code:** `getWorkoutSessionController` → `getWorkoutSession`.

Response `200`:

```json
{
  "id": "e5f6a7b8-0000-4000-8000-000000000001",
  "name": "Push",
  "workoutDayId": "a1b2c3d4-0000-4000-8000-000000000001",
  "status": "IN_PROGRESS",
  "startedAt": "2026-11-08T17:02:11.000Z",
  "completedAt": null,
  "bodyWeightKg": null,
  "exercises": [
    {
      "id": "f6a7b8c9-0000-4000-8000-000000000001",
      "order": 1,
      "exerciseSummary": { "id": "c3d4e5f6-0000-4000-8000-000000000001", "name": "Bench Press", "type": "WEIGHT_REPS", "primaryMuscle": "Chest", "imageUrl": null },
      "restSeconds": null,
      "sets": [
        { "id": "a7b8c9d0-0000-4000-8000-000000000001", "setType": "NORMAL", "setNumber": 1, "plannedWeight": null, "plannedReps": null, "plannedDuration": null, "plannedDistance": null, "weight": 60, "reps": 8, "duration": null, "distance": null, "completedAt": "2026-11-08T17:05:40.000Z" }
      ]
    }
  ],
  "summary": null
}
```

| Field | Type | Notes |
|---|---|---|
| `name` | string | The day's name, or `"Workout"` for a session with no day |
| `workoutDayId` | string \| null | `null` for an empty workout or when the day was deleted |
| `status` | `"IN_PROGRESS"` \| `"COMPLETED"` \| `"CANCELLED"` | `WorkoutSessionStatus` |
| `startedAt`, `completedAt` | ISO string, `completedAt` nullable | |
| `exercises[].sets[].planned*` | number \| null | Targets copied from the plan when the workout starts |
| `exercises[].sets[].weight` / `reps` / `duration` / `distance` | number \| null | What the user did |
| `exercises[].sets[].completedAt` | ISO string \| null | `null` = set not ticked |
| `summary` | `WorkoutSummary` \| null | `null` unless `status` is `COMPLETED`. `durationSeconds`, `setsCompleted` / `setsTotal`, `volumeKg` (completed sets with weight and reps), `exerciseCount`, `prSetIds` (empty until PR detection exists) |

Status codes:

- `200` workout returned
- `401` missing, invalid, or expired access token
- `404` `{ "message": "Workout not found." }`
- `500` unexpected error

Failure example: another user's `sessionId` returns `404` `{ "message": "Workout not found." }`.

Frontend types: `WorkoutSession`, `WorkoutSessionExercise`, `WorkoutSessionSet` and `WorkoutSummary` in `frontend/src/features/workouts/shared/workouts.types.ts`.

### `PATCH /api/workout-sessions/:sessionId`

Discards a workout in progress.

- **Path:** `sessionId`.
- **Body:** `{ "status": "CANCELLED" }` — the only accepted value.
- **Code:** `discardWorkoutSessionController` → `discardWorkoutSession`.

Response `204` — no body. The session stays in the database with `status = CANCELLED`.

Status codes:

- `204` workout discarded
- `400` body is not `{ "status": "CANCELLED" }` — e.g. `{ "message": "Invalid input: expected \"CANCELLED\"" }`
- `401` missing, invalid, or expired access token
- `404` `{ "message": "Workout not found." }`
- `409` `{ "message": "This workout is finished or cancelled." }`
- `500` unexpected error

Failure example: discarding the same workout twice returns `409` `{ "message": "This workout is finished or cancelled." }` the second time.

### `POST /api/workout-sessions/:sessionId/finish`

Finishes a workout in progress: `status` becomes `COMPLETED` and `completedAt` is set.

- **Path:** `sessionId`. No body.
- **Rule:** at least one set must be ticked (`completedAt` not null).
- **Safe to repeat:** finishing a `COMPLETED` workout returns it again with `200`, so a retry after a lost response is not an error.
- **Code:** `finishWorkoutSessionController` → `finishWorkoutSession`.

Response `200`: the finished workout, same shape as `GET /api/workout-sessions/:sessionId`, with its `summary`. The award (XP, level) is not implemented yet.

Status codes:

- `200` workout finished, or already finished
- `401` missing, invalid, or expired access token
- `404` `{ "message": "Workout not found." }`
- `409` `{ "message": "This workout was discarded." }`
- `422` `{ "message": "Complete at least one set to finish." }`
- `500` unexpected error

Failure example: finishing a workout with no ticked set returns `422` `{ "message": "Complete at least one set to finish." }`.

### `POST /api/workout-sessions/:sessionId/exercises`

Adds exercises at the end of a workout in progress, each with one empty set.

- **Path:** `sessionId`.
- **Body:** `{ "exerciseIds": string[] }` — 1 to 20 UUIDs, no duplicates; a non-UUID item returns `400 "Exercise not found."`. Messages: `"Pick at least one exercise."`, `"A workout can have at most 20 exercises."`, `"Pick each exercise only once."`.
- **Limit:** at most 20 exercises per workout, counting the ones already there (`MAX_EXERCISES` in `backend/src/lib/validation.ts`).
- **Effects:** in one transaction, the exercises get `order` = current highest + 1, + 2, … in the order sent; each gets set 1 (`NORMAL`, all values `null`).
- **Code:** `addSessionExercisesController` → `addSessionExercises`.

Response `201` — the new exercises, `WorkoutSessionExercise[]` by `order` ascending.

Status codes:

- `201` exercises added
- `400` body fails validation
- `401` missing, invalid, or expired access token
- `404` `{ "message": "Workout not found." }` or `{ "message": "Exercise not found." }` (an id is not in the catalog)
- `409` `{ "message": "This workout is finished or cancelled." }`, or `{ "message": "The workout changed. Please try again." }` when another request added exercises at the same time
- `422` `{ "message": "A workout can have at most 20 exercises." }`
- `500` unexpected error

Failure example: a workout with 19 exercises plus 2 more returns `422` `{ "message": "A workout can have at most 20 exercises." }`.

### `PATCH /api/workout-sessions/:sessionId/exercises/:exerciseId`

Moves an exercise one place up or down by swapping `order` with its neighbour.

- **Path:** `sessionId`, `exerciseId` (the workout exercise's `id`, not the catalog exercise).
- **Body:** `{ "direction": -1 }` (up) or `{ "direction": 1 }` (down).
- **Code:** `moveSessionExerciseController` → `moveSessionExercise`.

Response `200`: the workout's exercise ids in their new order, e.g. `["f6a7…02", "f6a7…01", "f6a7…03"]`.

Status codes:

- `200` exercise moved
- `400` `{ "message": "Direction must be -1 (up) or 1 (down)." }`
- `401` missing, invalid, or expired access token
- `404` `{ "message": "Workout not found." }` or `{ "message": "Exercise not found." }`
- `409` `{ "message": "This workout is finished or cancelled." }`, or `{ "message": "The workout changed. Please try again." }` when another request changed the order at the same time
- `422` `{ "message": "This exercise is already first." }` or `{ "message": "This exercise is already last." }`
- `500` unexpected error

Failure example: moving the first exercise up returns `422` `{ "message": "This exercise is already first." }`.

### `POST /api/workout-sessions/:sessionId/exercises/:exerciseId/sets`

Adds an empty set at the end of one exercise of a workout in progress.

- **Path:** `sessionId`, `exerciseId` — `exerciseId` is the `WorkoutSessionExercise.id` (the `exercises[].id` of the session), not the catalog exercise id. No body.
- **Effects:** `setNumber` = the exercise's highest + 1; `setType` `NORMAL`; every value `null`.
- **Limit:** at most 20 sets per exercise (`MAX_SETS_PER_EXERCISE` in `backend/src/lib/validation.ts`).
- **Code:** `addSessionSetController` → `addSessionSet`.

Response `201` — the new set, one `WorkoutSessionSet`.

Status codes:

- `201` set added
- `401` missing, invalid, or expired access token
- `404` `{ "message": "Workout not found." }` or `{ "message": "Exercise not found." }` (the exercise is not in this workout)
- `409` `{ "message": "This workout is finished or cancelled." }`, or `{ "message": "The workout changed. Please try again." }` when another request added a set at the same time
- `422` `{ "message": "An exercise can have at most 20 sets." }`
- `500` unexpected error

Failure example: an `exerciseId` from another workout returns `404` `{ "message": "Exercise not found." }`.

### `PATCH /api/workout-sessions/:sessionId/sets/:setId`

Changes what the user did in one set, or ticks/unticks it.

- **Path:** `sessionId`, `setId`.
- **Body:** every field optional, at least one present (else `400 "Nothing to update."`). A missing field keeps its value; `null` clears it.

| Field | Type | Limits |
|---|---|---|
| `weight` | number \| null | 0–1000, at most 2 decimals |
| `reps` | integer \| null | 1–999 |
| `duration` | integer \| null | 1–86400 (seconds) |
| `distance` | number \| null | more than 0, at most 1000000, 1 decimal |
| `setType` | `"NORMAL"` \| `"HEAVY"` \| `"WARMUP"` \| `"DROP"` \| `"FAILURE"` | |
| `completed` | boolean | `true` sets `completedAt` (keeps the first time if already ticked); `false` clears it |

- **Code:** `updateSessionSetController` → `updateSessionSet` (find and update in one transaction).

Response `200` — the updated set, one `WorkoutSessionSet`.

Status codes:

- `200` set updated
- `400` body fails validation — e.g. `{ "reps": 0 }` returns `{ "message": "Reps must be a whole number between 1 and 999." }`
- `401` missing, invalid, or expired access token
- `404` `{ "message": "Workout not found." }` or `{ "message": "Set not found." }` (the set is not in this workout)
- `409` `{ "message": "This workout is finished or cancelled." }`
- `500` unexpected error

Failure example: `{}` returns `400` `{ "message": "Nothing to update." }`.

### `DELETE /api/workout-sessions/:sessionId/sets/:setId`

Deletes one set and renumbers that exercise's remaining sets 1..n, in one transaction.

- **Path:** `sessionId`, `setId`. No body.
- **Code:** `deleteSessionSetController` → `deleteSessionSet`.

Response `204` — no body.

Status codes:

- `204` set deleted
- `401` missing, invalid, or expired access token
- `404` `{ "message": "Workout not found." }` or `{ "message": "Set not found." }`
- `409` `{ "message": "This workout is finished or cancelled." }`, or `{ "message": "The workout changed. Please try again." }` when another request changed the set numbers at the same time
- `500` unexpected error

Failure example: deleting the same set twice returns `404` `{ "message": "Set not found." }` the second time.

## Frozen S3 target resources

Design the smallest coherent REST contract around:

- owned custom plans and days (list read implemented above; create/detail/update/delete pending);
- ordered planned exercises/sets;
- starting empty/planned sessions;
- active session sets;
- session completion and authenticated history.

Before adding routes, inspect actual schema names and agree with S1 on error/auth conventions and S5 on completion DTOs. Do not treat the examples here as already implemented.

## Idempotency and concurrency

- Prevent or deterministically resolve multiple active-session starts.
- Starting a planned workout copies the plan snapshot atomically.
- Repeated completion must not create duplicate rewards/side effects.
- Reordering multiple records uses a transaction.
- Closed sessions reject further mutations.

## Documentation completion gate

For each merged endpoint record method/path, auth, request/query schema, response DTO, ownership rule, important status codes, and one failure example. Never document planned behavior as shipped.
