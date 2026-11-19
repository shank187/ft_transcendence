*This project has been created as part of the 42 curriculum by aelbour, abel-had, zyahansa, mouarar, sabadri.*

# Gym App — ft_transcendence

## Description

Gym App is a five-person, full-stack social fitness platform built for the 42 `ft_transcendence` project (subject v21.1). Its validation product connects one loop:

```text
Discover a gym → plan a workout → train and log sets → review progress → earn achievements → interact with friends
```

The project deliberately freezes scope around a reliable 14-point validation target. AI/coaches, social feeds, advanced workout mutation, advanced recommendations, and other bonus work remain deferred until the core validation gate is green.

### Validation features

- Secure email/password authentication and first-login onboarding
- Own profile, avatar, OAuth, legal pages, and multi-user correctness
- Gym discovery, details, equipment, search, filtering, sorting, and pagination
- Canonical exercise catalog with muscle groups, equipment, and exercise types
- Custom workout plans, workout days, ordered exercises, and planned sets
- Empty or planned workout sessions with historical snapshots
- Type-aware set logging, workout completion, history, volume, and basic PRs
- Friends, presence, real-time chat, and message history
- XP, achievements, and leaderboard
- Responsive custom design system and Chrome/Firefox/Edge verification

Implementation status must be taken from GitHub/Trello. A feature listed in the frozen target is not automatically implemented.

## Current implementation checkpoint — 16 November 2026

What exists on `main` at `49cb343` (routes and pages in the code, not a claim that each module is validated):

- React/Vite/TypeScript frontend, Express/TypeScript backend, PostgreSQL through Prisma, Docker Compose
- Auth: email/password with email code, Google OAuth, refresh/logout/session check, onboarding
- Profile: own profile, settings, avatar, public profile, Privacy and Terms pages
- Gyms: search, details, current gym, gym submission and admin review
- Workouts (S3): plans, days, day editor, exercise picker (search, filters, sort, gym filter, pagination), active workout, finish with PRs and XP
- Progress: summary and leaderboard
- Social: friends, requests, blocking, conversations and WebSocket chat

The full endpoint list is in [`docs/api.md`](docs/api.md).

## Technical stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | React 19, React Router, Vite, TypeScript, Tailwind CSS | Component UI, typed client code, fast builds, responsive styling |
| Backend | Node.js, Express 5, TypeScript, Zod | Explicit HTTP API and runtime validation |
| Data | PostgreSQL, Prisma 6 | Relational integrity, migrations, typed database access |
| Infrastructure | Docker Compose, GitHub | Reproducible services and collaborative review |

The application is a modular monolith: one frontend, one Express backend, one PostgreSQL database, and domain modules inside the shared applications. It is not a microservice system.

## Instructions

### Prerequisites

- Git
- Docker Engine with Docker Compose v2
- Node 24 (only to run build/lint outside Docker; `nvm use` reads `.nvmrc`)
- A local `.env` derived from the committed non-secret example

### Setup

```bash
git clone https://github.com/shank187/ft_transcendence.git
cd ft_transcendence
cp .env.example .env
```

Fill every required value with local credentials. Never commit `.env` or real secrets. Compose refuses to start while a required value (database, JWT secrets, SMTP, URLs) is missing.

### Start

```bash
make
```

Equivalent current command:

```bash
docker compose up -d --build
```

Open the application at **https://localhost:4438**.

Default development ports currently exposed:

- Nginx HTTPS: `4438` on the host, forwarded to `443` inside the container
- PostgreSQL: `5432`
- Prisma Studio: `5555` when started with `make db-studio`

Frontend `5173` and backend `3000` are internal container ports reached through Nginx.
Set `FRONTEND_URL` and `VITE_API_URL` to `https://localhost:4438` and
`GOOGLE_REDIRECT_URI` to `https://localhost:4438/api/auth/google/callback`.
In the Google OAuth client settings, register `https://localhost:4438` as an
authorized JavaScript origin and the same callback URL as an authorized redirect URI.

Ports and public development URLs are configuration, not secrets. Passwords, tokens, private keys, and deployment credentials are secrets.

### Verification

```bash
docker compose ps
docker compose logs backend
docker compose logs frontend
```

Run narrow checks inside the relevant service or local environment:

```bash
cd frontend && npm run build && npm run lint
cd backend && npm run build && npm run prisma:validate
```

Outside Docker, `npx prisma generate` needs `DATABASE_URL`: copy `backend/.env.example` to `backend/.env` and fill it first.

## Architecture and documentation

- [`docs/architecture.md`](docs/architecture.md) — system boundaries, slices, request flow, and contracts
- [`docs/api.md`](docs/api.md) — implemented endpoints and API conventions
- [`docs/contracts.md`](docs/contracts.md) — what S2, S3 and S5 rely on from each other
- [`docs/database-relationships.md`](docs/database-relationships.md) — focused schema diagrams and delete rules
- [`docs/database.md`](docs/database.md) — current schema mental model and historical-data rules
- [`docs/development.md`](docs/development.md) — branch, review, verification, and environment workflow
- [`docs/pr-guide.md`](docs/pr-guide.md) — PR shape, naming, and the required PR description
- [`docs/SCOPE_AND_VALIDATION.md`](docs/SCOPE_AND_VALIDATION.md) — frozen product, 14-point module plan, and cutoffs
- [`docs/UPGRADE.md`](docs/UPGRADE.md) — October 2026 dependency upgrade: what changed, what to run after pulling, what is deferred

The executable sources remain authoritative for current implementation details:

- `frontend/src/App.tsx`
- `backend/src/app.ts`
- `backend/prisma/schema.prisma`
- `docker-compose.yml`
- `Makefile`

## Team information

| Member | Login | Role | Slice/responsibility |
|---|---|---|---|
| Aymane El Bour | `aelbour` | Technical Lead / Architect; Developer | Architecture/review and S3 Workout Planning & Execution |
| Abdelhamid El Haddadi | `abel-had` | Project Manager; Developer | S1 Platform & Identity |
| Salaheddine Badri | `sabadri` | Product Owner; Developer | S5 Progress & Gamification |
| Zyad Ahansal | `zyahansa` | Developer | S2 Gym Discovery & Equipment |
| Mohamed Ouarar | `mouarar` | Developer | S4 Social & Real-Time Interaction |

### Project management

- Trello: scope, priorities, ownership, and integration gates
- GitHub branches and pull requests: implementation and peer review
- Discord/team meetings: decisions and blocker escalation
- Vertical slices: each owner delivers frontend → API → service → Prisma → PostgreSQL flows

## Frozen modules — 14 points

| Module | Size | Points | Primary ownership |
|---|---:|---:|---|
| Frontend + Backend Frameworks | Major | 2 | Shared |
| ORM | Minor | 1 | Shared/database |
| Standard User Management | Major | 2 | S1 + S4 |
| User Interaction | Major | 2 | S4 |
| Real-Time Features | Major | 2 | S4 + S1 infrastructure |
| Advanced Search | Minor | 1 | S2 + S3 |
| Custom Design System | Minor | 1 | Shared frontend |
| Gamification | Minor | 1 | S5 |
| OAuth 2.0 | Minor | 1 | S1 |
| Two Additional Browsers | Minor | 1 | Shared QA |
| **Total** |  | **14** |  |

Only fully working and demonstrable modules count. Detailed evidence and final contributors must be completed before evaluation.

## Database schema

The canonical schema is `backend/prisma/schema.prisma`. Key tables and relations (`|o` zero or one, `||` exactly one, `o{` zero or many):

```mermaid
erDiagram
    User |o..o{ Gym : creates
    Gym |o..o{ User : "current gym of"
    Gym ||--o{ GymEquipment : offers
    Equipment ||--o{ GymEquipment : "listed in"
    Exercise }o..o{ Equipment : "needs (ExerciseEquipment)"
    User ||..o{ GymSubmission : submits
    User |o..o{ GymSubmission : reviews
    Gym |o..o{ GymSubmission : "is about"
    Gym |o..o{ GymSubmission : "private copy"
    GymSubmission }o..o{ Equipment : "proposes (GymSubmissionEquipment)"
    User |o..o{ WorkoutPlan : owns
    WorkoutPlan ||..o{ WorkoutDay : contains
    WorkoutDay ||..o{ WorkoutExercise : contains
    Exercise ||..o{ WorkoutExercise : "placed as"
    WorkoutExercise ||..o{ WorkoutExerciseSet : targets
    User ||..o{ WorkoutSession : performs
    WorkoutDay |o..o{ WorkoutSession : "started from"
    WorkoutSession ||..o{ WorkoutSessionExercise : contains
    Exercise ||..o{ WorkoutSessionExercise : "performed as"
    WorkoutSessionExercise ||..o{ WorkoutSet : logs
    User ||--o{ Friendship : requests
    User ||--o{ Friendship : receives
    User ||..o{ Conversation : "user1 of"
    User ||..o{ Conversation : "user2 of"
    Conversation ||..o{ Message : contains
    User ||..o{ Message : sends
    User ||..o{ XpEvent : earns
    User ||--o{ UserAchievement : unlocks

    User {
        String id PK
        String username UK
        String currentGymId FK "nullable"
    }
    Gym {
        String id PK
        GymVisibility visibility
        Boolean verified
        DateTime closedAt "nullable"
    }
    Equipment {
        String id PK
        String name UK
        EquipmentCategory category
    }
    GymEquipment {
        String gymId PK, FK
        String equipmentId PK, FK
    }
    GymSubmission {
        String id PK
        GymSubmissionKind kind
        GymSubmissionStatus status
        String gymId FK "nullable"
    }
    Exercise {
        String id PK
        String name UK
        ExerciseType type
    }
    WorkoutPlan {
        String id PK
        String userId FK "nullable"
        String name
    }
    WorkoutDay {
        String id PK
        String workoutPlanId FK
        Int dayOrder
    }
    WorkoutExercise {
        String id PK
        String workoutDayId FK
        String exerciseId FK
        Int order
    }
    WorkoutExerciseSet {
        String id PK
        String workoutExerciseId FK
        Int setNumber
        Int targetReps "nullable"
    }
    WorkoutSession {
        String id PK
        String userId FK
        String workoutDayId FK "nullable"
        WorkoutSessionStatus status
    }
    WorkoutSessionExercise {
        String id PK
        String workoutSessionId FK
        String exerciseId FK
        Int order
    }
    WorkoutSet {
        String id PK
        Int plannedReps "nullable"
        Int reps "nullable"
        Boolean isPr
    }
    Friendship {
        String requesterId PK, FK
        String addresseeId PK, FK
        FriendshipStatus status
    }
    Conversation {
        String id PK
        String user1Id FK
        String user2Id FK
    }
    Message {
        String id PK
        String conversationId FK
        String senderId FK
        String content
    }
    XpEvent {
        String userId FK
        XpReason reason UK "unique with sourceId"
        String sourceId UK
        Int amount
    }
    UserAchievement {
        String userId PK, FK
        String code PK
        DateTime unlockedAt
    }
```

Design decisions:

- **Plans vs history.** Starting a workout copies the plan's targets into the session (`WorkoutSet.planned*`), so editing a plan never changes past workouts.
- **One canonical `Equipment` table** shared by gyms (`GymEquipment`) and exercises (`ExerciseEquipment`), so "what can I do at my gym" is a join, not a second vocabulary.
- **One `Gym` table with states.** `visibility`, `verified`, `source` and `closedAt` describe verified, unverified, private and closed gyms. A member's `GymSubmission` changes nothing until an admin approves it in one transaction, guarded on `status = PENDING` and on the gym's `updatedAt`, so a double click or a stale suggestion returns 409.
- **Rewards are an event log.** `XpEvent` is unique on `(reason, sourceId)`, so a workout or an approval never pays twice; total XP, level and leaderboard are computed from it.
- **Delete rules.** Cascade for data a user owns, SetNull for references history must survive, Restrict for catalog rows that history uses.

Details: [docs/database.md](docs/database.md) (domains, invariants, migrations) and [docs/database-relationships.md](docs/database-relationships.md) (focused diagrams and delete rules).

## Resources and AI usage

Primary references:

- `ft_transcendence` subject v21.1
- React, React Router, Vite, Express, Prisma, PostgreSQL, Docker Compose, TypeScript, and Zod official documentation

AI was used for bounded explanations, documentation drafting, review checklists, debugging hypotheses, and planning. Generated work must be inspected, tested, understood, and peer-reviewed. AI output is not accepted as implementation evidence by itself, and each owner must be able to explain and modify their code during evaluation.

## Individual contributions

Taken from the merged commits and pull requests on `main`.

- **aelbour (S3, Technical Lead):** workout schema, exercise catalog and search, plans, days, day editor, active workout, finish with PRs and the S5 award call, next workout on Home, the contracts between S2, S3 and S5, and reviews. Details in [`docs/readme-parts/s3-workouts.md`](docs/readme-parts/s3-workouts.md).
- **abel-had (S1, Project Manager):** register, login and email verification, Google OAuth, refresh tokens and sessions, route guards, onboarding, own profile with avatar and password change, admin role, Privacy Policy and Terms of Service, backend input validation, HTTPS Nginx proxy and Docker setup.
- **zyahansa (S2):** gym search with filters and pagination, gym details, current gym, Google Places seeding of verified gyms, gym submissions with photos and equipment, landing page components.
- **mouarar (S4):** friends, friend requests and blocking, public profile, WebSocket chat with reconnection and presence, conversations and message history, Social page and the social part of Home.
- **sabadri (S5, Product Owner):** progress summary, XP and levels, achievements, leaderboard, Progress page, and the admin approval of gym submissions.

## Known gaps at this checkpoint

- Error response bodies: every module returns `{ message }` except some gyms errors (`{ error }`), until S1 finalizes the shared error DTO.
- S3: an exercise can't be removed from a workout in progress (its sets can).
- The list of past workouts moved to S5 (Progress) on 19 Nov; until it lands, a finished workout opens only from its link.
- CI/Gitleaks is not set up (no `.github/workflows`).
- Frozen S2/S4/S5 flows and several mandatory legal/security/QA requirements remain integration work.

This list is a dated checkpoint, not a permanent project status.
