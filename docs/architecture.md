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

These are target routes; check `frontend/src/App.tsx` before claiming implementation. At the 30 September checkpoint, the protected layout registers `/home`, `/workouts` (the user's plan list, backed by `GET /api/workout-plans`), and `/workouts/new-plan` (placeholder page). The temporary `/exercises` route was removed; `frontend/src/pages/Exercises.tsx` and the catalog still exist but are not routed until the catalog re-enters the frozen `/workouts/exercises` path or the plan exercise picker. `/workouts/new-plan` is the working create-plan route and replaces the earlier `/workouts/plans/new` proposal above; keep it unless there is a concrete reason to change it.

## Frontend structure and styling

```text
frontend/src/
  pages/            route-level components; thin, usually render one feature component
  features/<name>/  one folder per feature: <name>.api.ts, <name>.types.ts, feature components
  components/ui/    shared primitives (Button, Card, Form_input, Form_select, Or_divider)
  components/states/ shared LoadingState / ErrorState / EmptyState
  layouts/          MainLayout: authenticated shell (nav + <Outlet />)
  styles/globals.css design tokens (@theme) and global resets
```

- Styling is Tailwind utilities using the `app-*` tokens defined in `styles/globals.css` (`bg-app-canvas`, `bg-app-surface`, `border-app-border`, `text-app-text`, `text-app-text-secondary`, `text-app-text-muted`, `text-app-primary`, `text-app-danger`).
- The app is dark-only (`color-scheme: dark`). New code should not use raw Tailwind palette colors such as `text-gray-900` or `bg-white`. Existing components still use some; `globals.css` remaps those specific shades (`white`, `gray-100/200/300/500/600/700/900`, `red-600`) to their dark-theme token so they stay readable. If a needed color is missing, add an `app-*` token instead of hardcoding it.
- No per-component CSS files; shared visuals go into `components/ui`.
- Feature API modules call the backend through the shared Axios instance in `features/auth/axiosInstance.ts`.

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
