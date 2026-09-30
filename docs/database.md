# Database

## Status rule

`backend/prisma/schema.prisma` and `backend/prisma/migrations/` are authoritative. This file explains the model and its invariants; if it disagrees with the schema, the schema wins and this file must be fixed.

## Stack and access

- PostgreSQL 15 (Docker Compose service `postgres`, data in the `pgdata` volume)
- Prisma ORM; the backend reaches the database only through `backend/src/lib/prisma.ts`
- `DATABASE_URL` is built by Compose from `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB`, which are required and have no fallback
- The frontend never accesses PostgreSQL directly

```bash
cd backend
npm run prisma:validate   # schema check
npm run prisma:generate   # regenerate client after schema changes
npm run prisma:migrate    # create/apply a dev migration
```

## Domains

One shared database. Features extend the existing schema; they do not create parallel user, equipment, or workout-history entities.

```text
Identity        User, Role, UserRole, Session
Gyms (S2)       Gym, GymOpeningHour, Equipment, GymEquipment, Facility, GymFacility, GymReview
Exercises (S3)  MuscleGroup, Exercise, ExerciseSecondaryMuscle, ExerciseEquipment
Planning (S3)   WorkoutPlan, WorkoutDay, WorkoutExercise, WorkoutExerciseSet
Execution (S3)  WorkoutSession, WorkoutSessionExercise, WorkoutSet
Social (S4)     Friendship, Conversation, ConversationMember, Message
Shared          Notification, Media, ApiKey
```

## Identity

- `User` is the single account entity. `passwordHash` is null for Google-only accounts; `googleId` is unique when present.
- Onboarding fields (`experienceLevel`, `primaryGoal`, `unitSystem`, `heightCm`, `weightKg`) live on `User`; `onboardingCompletedAt` marks completion.
- `Session` stores refresh-token sessions as `tokenHash` (never the raw token), with `expiresAt` and `revokedAt`.

## Exercises and equipment

- `Exercise.type` (`ExerciseType`) decides which set fields apply (weight/reps/duration/distance).
- Exercises reference `MuscleGroup` (one primary, many secondary) and the canonical S2 `Equipment` through `ExerciseEquipment`. S3 must not create a second equipment vocabulary.
- `WorkoutExercise` and `WorkoutSessionExercise` reference `Exercise` with `onDelete: Restrict`, so an exercise used in a plan or history cannot be deleted.

## Workout planning vs execution

```text
Planning (reusable intent)                 Execution (history)
WorkoutPlan                                WorkoutSession  (userId, status, startedAt, completedAt)
  └─ WorkoutDay      (dayOrder)              └─ WorkoutSessionExercise  (order, restSeconds, supersetGroup)
       └─ WorkoutExercise (order)                 └─ WorkoutSet  (planned* snapshot + performed values)
            └─ WorkoutExerciseSet (target*)
```

Invariants encoded in the schema:

- `WorkoutPlan.userId` is nullable: owned plans have a user and default to `CUSTOM`; `RECOMMENDED` plans may have no owner. Owned-plan queries must filter by the authenticated `userId`.
- Ordering is unique per parent: `(workoutPlanId, dayOrder)`, `(workoutDayId, order)`, `(workoutExerciseId, setNumber)`, `(workoutSessionId, order)`, `(workoutSessionExerciseId, setNumber)`. Reordering several rows must run in one transaction.
- Deleting a plan cascades its days/exercises/sets, but `WorkoutSession.workoutDayId` is `SetNull`, so completed history survives.
- `WorkoutSet` keeps `plannedWeight/Reps/Duration/Distance` (copied when the session starts) separate from performed `weight/reps/duration/distance`. `completedAt = null` means the set is not done.
- `WorkoutSession.status` is `IN_PROGRESS`, `COMPLETED`, or `CANCELLED`. Closed sessions must reject mutation in the service layer; the `(userId, status)` index supports the active-session lookup.
- `WorkoutSession.bodyWeightKg` snapshots body weight at start for bodyweight-type volume.

Rules the schema cannot enforce and services must:

- at most one `IN_PROGRESS` session per user (check inside the start transaction);
- starting a planned workout copies targets and configuration atomically;
- repeated completion must not double-count S5 rewards.

## Migrations

Current migrations, in order:

```text
20260818200150_init_fitness_schema
20260902104928_workout_architecture
20260904110100_add_exercise_catalog_media
20260909141126_add_refresh_token
20260913120639_remove_user_refresh_token
20260914101847_add_google_auth
```

- Never edit an applied migration; add a new one.
- Never reset shared data without explicit team authorization.
- Discuss schema changes that affect another slice's contract (identity, equipment, completed-session data) before merging.
- Do not add fields speculatively; add them with the feature that uses them.
