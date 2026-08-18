# Database

## 1. Stack

- PostgreSQL
- Prisma ORM

The database is shared by the entire application.

The Prisma schema is located at:
```text
backend/prisma/schema.prisma
```
Feature developers must extend the existing schema instead of creating separate databases or duplicated versions of core entities.

---

## 2. Core Schema

The current schema is organized around the following domains:

```text
Identity
├── User
├── Role
├── UserRole
└── Session

Gyms
├── Gym
├── GymOpeningHour
├── Equipment
├── GymEquipment
├── Facility
├── GymFacility
└── GymReview

Workouts
├── Exercise
├── WorkoutPlan
├── WorkoutDay
├── WorkoutExercise
├── WorkoutSession
└── WorkoutSet

Social
├── Friendship
├── Conversation
├── ConversationMember
└── Message

Shared Infrastructure
├── Notification
├── Media
└── ApiKey
```

This is the initial shared core. It is not intended to contain every feature-specific entity from the beginning of the project.

---

## 3. Identity

### User
`User` is the central identity entity. Other features should reference the existing `User` instead of creating another user/account entity.

```text
User
 │
 ├── Roles
 ├── Sessions
 ├── Gyms created
 ├── Gym reviews
 ├── Workout plans
 ├── Workout sessions
 ├── Friendships
 ├── Conversations
 ├── Messages
 ├── Notifications
 ├── Media
 └── API keys
```

### Role / UserRole
Roles define application-level permissions.

```text
User
  │
  └── UserRole
        │
        └── Role
```
The many-to-many relationship is represented by `UserRole`.

### Session
Session represents an authenticated user session.

```text
User
 │
 └── Session
```
Authentication-related features should use the existing session system instead of creating another authentication/session model.

---

## 4. Gyms

The gym domain is centered around `Gym`.

```text
Gym
 │
 ├── GymOpeningHour
 │
 ├── GymEquipment ── Equipment
 │
 ├── GymFacility ── Facility
 │
 └── GymReview ── User
```

- **GymOpeningHour:** Stores the opening hours of a gym. A gym can have one opening-hours record for each day of the week.
- **Equipment:** Represents reusable equipment types. `GymEquipment` connects equipment to gyms. This avoids storing duplicated equipment definitions for every gym.
- **Facility:** Represents reusable facility types. `GymFacility` connects facilities to gyms.
- **GymReview:** A user can review a gym. A user can have at most one review for a particular gym.

---

## 5. Workouts

The workout domain is organized around plans, sessions, and exercises.

```text
User
 │
 └── WorkoutPlan
        │
        └── WorkoutDay
              │
              └── WorkoutExercise
                    │
                    └── Exercise
```

A completed workout is represented separately:

```text
User
 │
 └── WorkoutSession
        │
        └── WorkoutSet
              │
              └── Exercise
```

- **Exercise:** Represents a reusable exercise (e.g., Bench Press, Squat, Pull Up, Deadlift). Exercises are referenced by workout structures rather than duplicated inside every workout.
- **WorkoutPlan:** Represents a workout program owned by a user or a reusable template. A plan contains multiple `WorkoutDay` records.
- **WorkoutDay:** Represents one day/session structure inside a workout plan. The order of days is stored using `dayOrder`.
- **WorkoutExercise:** Connects an exercise to a workout day and determines its order.
- **WorkoutSession:** Represents an actual workout performed by a user. This is separate from `WorkoutPlan` because a planned workout and an actual completed workout are different concepts.
- **WorkoutSet:** Stores performed set data such as Repetitions, Weight, Duration, Distance, and Notes. This structure can later support progress tracking and statistics without creating a second workout-history system.

---

## 6. Social

The social domain currently contains friendships and messaging.

### Friendship
Represents a relationship between two users.

```text
User
 │
 ├── Friendship
 │
 └── User
```
The relationship has a status: `PENDING`, `ACCEPTED`, `BLOCKED`.

### Conversation
Represents a conversation between users.

```text
Conversation
 │
 ├── ConversationMember ── User
 │
 └── Message ── User
```
`ConversationMember` connects users to conversations. `Message` stores the sender and message content.

---

## 7. Shared Infrastructure

- **Notification:** Notifications belong to users. Feature-specific systems can create notifications through this shared entity instead of creating separate notification tables.
- **Media:** Media represents uploaded files associated with users. It can later be referenced by different features such as Profiles, Posts, Workout content, and Coach content.
- **ApiKey:** Stores API key information associated with a user. Only hashed API keys should be stored. Raw API keys must never be stored in the database.

---

## 8. Core Database Principles

- **One shared database:** All application features use the same PostgreSQL database.
- **One identity system:** There is one central `User` entity. Do not create another user/account model for a feature.
- **Reuse existing entities:** Before creating a model, check whether the existing schema already provides the required entity.
- **Feature-specific extensions:** Features may add their own models when required.

*Example of extending the core (not currently in the core schema):*
```text
Core User
   │
   ├── CoachProfile
   ├── Achievement
   ├── Post
   └── ProgressRecord
```
- **Avoid unnecessary coupling:** A feature should not modify unrelated core models unless the change is actually required.

---

## 9. Important Rules

1. Do not create another `User` table.
2. Do not create another authentication/session system.
3. Reuse existing relationships whenever possible.
4. Feature-specific tables may be added when required.
5. Discuss structural changes affecting shared entities before merging.
6. Do not modify existing relations casually.
7. Use Prisma migrations for schema changes.
8. Never manually modify the production database.
9. Never commit `.env` or database credentials.
10. Never store raw passwords or API keys.
11. Use foreign-key relations instead of duplicating related data.
12. Keep feature-specific models isolated from unrelated domains.

---

## 10. Adding a New Model

Before adding a new model:

**Step 1 — Check the existing schema**
Read `backend/prisma/schema.prisma` and check whether an existing model can be reused.

**Step 2 — Check the documentation**
Read `docs/database.md` to understand the existing relationships.

**Step 3 — Decide whether the model is really necessary**
Prefer:
```text
Existing Core Entity
        │
        └── Feature Extension
```
instead of duplicating an entity.

**Step 4 — Define the relation**
If the feature belongs to a user, gym, workout, etc., create an explicit Prisma relation to the existing entity.
Example:
```prisma
model CoachProfile {
  id     String @id @default(uuid())
  userId String @unique

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

**Step 5 — Validate the schema**
```bash
npx prisma format
npx prisma validate
```

**Step 6 — Create a migration**
```bash
npx prisma migrate dev --name <migration-name>
```

**Step 7 — Generate Prisma Client**
```bash
npx prisma generate
```

**Step 8 — Test the feature**
Make sure existing features and relations are not broken.

---

## 11. Database Migration Rules

Schema changes must be made through Prisma migrations.
```text
schema.prisma
      │
      ▼
prisma migrate dev
      │
      ▼
Migration
      │
      ▼
PostgreSQL
```
Do not make manual schema changes directly in PostgreSQL. Migration names should describe the change (e.g., `add_coach_profile`, `add_workout_progress`).

---

## 12. Working With the Shared Schema

The database is a shared resource. A developer working on a feature should:
- Read the existing schema.
- Reuse existing models.
- Avoid unrelated schema changes.
- Clearly identify new models and relations.
- Test migrations locally.
- Document important structural changes.
- Inform the team when a change affects another feature.

Changes to shared core entities should be reviewed carefully because multiple features may depend on them.

---

## 13. Core vs Feature-Specific Models

The core schema provides stable shared foundations. Feature-specific models belong to the feature that requires them.

Example:
```text
CORE
│
├── User
├── Gym
├── Exercise
├── WorkoutPlan
├── WorkoutSession
└── Message

FEATURE EXTENSIONS
│
├── CoachProfile
├── Achievement
├── Post
├── ProgressRecord
└── Challenge
```
A feature should extend the core rather than redesigning it.

---

## 14. Schema Ownership

The Technical Lead maintains the shared database architecture and core schema. Feature developers are responsible for the database models required by their features.

Any change that significantly affects:
- User
- Authentication
- Sessions
- Core gym relations
- Core workout relations
- Shared infrastructure
- Multiple feature domains

should be discussed before implementation or merging. The Technical Lead owns the architectural consistency of the schema, not the implementation of every feature's database work.

---

## 15. Documentation

The database documentation should be updated when significant schema changes are introduced.

The Prisma schema is the source of truth for the actual database structure:
```text
backend/prisma/schema.prisma
```
This document explains the architecture, relationships, and rules around that schema. If the documentation and Prisma schema disagree, the Prisma schema must be checked and the documentation updated accordingly.