# Architecture

## Status and boundaries

Gym App is a modular monolith:

```text
Browser
  ↓ HTTPS (deployment requirement)
React + React Router + TypeScript
  ↓ JSON/HTTP; WebSocket only where real-time is required
Express + TypeScript domain modules
  ↓ Prisma Client
PostgreSQL
```

It is not a microservice architecture. All slices share one repository, one frontend, one backend, one identity model, and one relational database.

## Responsibilities

| Boundary | Owns | Does not own |
|---|---|---|
| Frontend | rendering, interaction, client routing, request state, UX validation | authorization, database access, authoritative business rules |
| Express API | authentication, authorization, runtime validation, business orchestration, response/error contract | direct UI state |
| Service/domain logic | ownership, lifecycle, transactions, historical rules | HTTP parsing/rendering |
| Prisma/PostgreSQL | persistent relations, constraints, transactions, queries | browser/API behavior |

## Five slices

| Slice | Domain |
|---|---|
| S1 | Platform & Identity |
| S2 | Gym Discovery & Equipment |
| S3 | Workout Planning & Execution |
| S4 | Social & Real-Time Interaction |
| S5 | Progress & Gamification |

Slices are ownership boundaries, not separate applications.

## Frontend routing model

Public routes live outside authentication. Authenticated pages are nested under `ProtectedRoute` and `MainLayout`; child pages render through `<Outlet />`.

```text
NavLink
  → React Router match
  → ProtectedRoute checks auth state
  → MainLayout renders shared shell
  → Outlet renders the matched page
```

Frozen top-level navigation:

```text
Home · Gyms · Workouts · Progress · Social · Profile
```

Frozen workout routes:

```text
/workouts
/workouts/exercises
/workouts/exercises/:id
/workouts/plans
/workouts/plans/new
/workouts/plans/:id
/workouts/session/:id
```

These are target routes; check `frontend/src/App.tsx` before claiming implementation. At the 17 September checkpoint, only `/home` and `/exercises` are registered inside the protected layout, and `/workouts` is the active bridge task. `/exercises` is a temporary implemented route; the frozen UX nests it under `/workouts/exercises` when navigation is integrated.

## Backend organization

The current backend mounts modules from `backend/src/app.ts`. Keep this flow:

```text
route → controller → service/domain rule → Prisma → database
```

Controllers handle HTTP details. Services own meaningful business and lifecycle rules. Middleware owns reusable concerns such as authentication. Prisma models are not API DTOs by default.

## Cross-slice contracts

### Identity

S1 authenticates the request and supplies server-derived `req.userId`. Every user-owned mutation validates ownership on the backend.

### Equipment

S2 owns canonical equipment used by gyms. S3 references the same `Equipment.id`; it must not create a second vocabulary.

### Completed workout data

S3 owns performed sessions/sets and workout history as source data. S5 consumes completed data for summaries, XP, achievements, and leaderboard. S5 must not create a competing workout-history store.

### Real time

S4 owns friendship/presence/chat behavior. Add WebSockets only to flows needing live delivery; normal CRUD remains HTTP.

## Workout lifecycle

```text
Plan (future intent)
  → Day/routine
  → Planned exercise
  → Planned set target
  → Start workout transaction
  → Session snapshot
  → Performed sets
  → Completed session/history
  → S5 progress/gamification consumption
```

The planning and execution models remain separate. A completed session must remain meaningful if the user later edits/deletes a plan or the exercise catalog changes.

## Security and environment

- Public/external connections to the backend use HTTPS in the validated deployment.
- `.env` is local and ignored; `.env.example` contains no secret values.
- Compose must receive required secrets explicitly and fail clearly when missing.
- Passwords are hashed; tokens/secrets never appear in Git or logs.
- Runtime input is validated on both frontend (UX) and backend (authority).
- Concurrent lifecycle operations use constraints/transactions where correctness depends on atomicity.

## Architecture decision rules

- Prefer explicit, reviewable modules over premature generic abstractions.
- Reuse shared UI only when reuse is real.
- Discuss shared architecture/schema contract changes before merging.
- Preserve historical correctness and authenticated ownership over convenience.
- Implementation truth comes from code/schema; frozen documents describe the agreed target.
