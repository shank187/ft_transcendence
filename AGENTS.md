# AGENTS.md — ft_transcendence

## Authority order

Use these sources in order and report conflicts:

1. Current `ft_transcendence` subject v21.1
2. `docs/SCOPE_AND_VALIDATION.md` for the frozen validation product/modules
3. Current executable code and `backend/prisma/schema.prisma`
4. `docs/architecture.md`, `docs/api.md`, `docs/database.md`, and `docs/development.md`
5. Live GitHub/Trello evidence for current progress and ownership

Never treat a dated checkpoint as permanent. Never claim that frozen target scope is already implemented.

## Product and deadline

This is a five-slice social fitness application targeting reliable 14-point validation before 16–20 November 2026. Core validation and integration outrank bonuses. Reserve time for regression testing, documentation, peer review, evaluation practice, and contract fixes.

Defer AI/coaches, social feeds, advanced recommendations, and advanced workout controls until the validation gate is green.

## Architecture

- Modular monolith: one React frontend, one Express backend, one PostgreSQL database
- Docker Compose provides the local service topology
- Prisma is the normal database-access boundary
- Browser → API → controller → service/business rule → Prisma → PostgreSQL
- Frontend never accesses PostgreSQL directly
- Backend authorization never trusts user IDs or ownership claims from the browser

## Slice ownership

- S1: platform, identity, auth/session, onboarding, profile, OAuth, legal, shell, environment/security conventions
- S2: gyms, gym details, canonical equipment, current gym, advanced gym search
- S3: exercises, workout planning, workout execution, snapshots, sets, completion, workout history, basic PRs
- S4: public profiles, friends, presence, chat, WebSockets
- S5: progress views, volume/PR consumption, XP, achievements, leaderboard

The Technical Lead coordinates contracts and reviews critical shared changes; this does not transfer teammate implementation ownership.

## Critical contracts

- S1 → all: authenticated `req.userId`, session lifecycle, consistent error DTOs
- S2 → S3: canonical `Equipment.id` and gym-equipment availability
- S3 → S5: completed session/set DTOs, applicable volume, PR rules, idempotent completion
- S4 → S1/Home: presence and unread/message data
- S5 → Home: summary/progress data

## Workout invariants

- `WorkoutPlan`/`WorkoutDay`/`WorkoutExerciseSet` are reusable planning intent.
- `WorkoutSession`/`WorkoutSessionExercise`/`WorkoutSet` are execution/history.
- Starting a planned workout copies planned targets and relevant configuration into the session representation.
- Planned values and performed values remain distinct.
- Ownership comes from authenticated identity.
- Editing/deleting a plan must not corrupt completed history.
- Closed sessions reject further mutation.
- Repeated completion must not double-count S5 rewards.

## Working rules

- Inspect branch, status, current files, and relevant contracts first.
- Make the smallest coherent change; preserve unrelated teammate work.
- Do not add schema fields, dependencies, routes, or shared abstractions speculatively.
- Validate browser input at runtime; TypeScript is not runtime validation.
- Handle loading, error, empty, success, repeated-action, and ownership states deliberately.
- Do not suppress dependency warnings or add effect dependencies blindly; reason about request lifecycle.
- Never commit `.env`, credentials, tokens, or keys. `.env.example` contains names/placeholders only.
- Never reset data, rewrite history, force-push, or edit old migrations without explicit authorization.

## Review format

- BLOCKING: security, correctness, ownership, historical-data loss, evaluation rejection, race/data corruption
- IMPORTANT: fragile contracts, poor failure handling, missing tests/docs, maintainability risks
- OPTIONAL: polish, naming, small refactors, nonessential optimization

Separate verified defects from risks and preferences.

## Verification

Run the narrowest relevant checks first. Typical commands:

```bash
cd frontend && npm run build && npm run lint
cd backend && npm run build && npm run prisma:validate
docker compose config
git diff --check
git status -sb
```

For each meaningful flow verify success, failure, unauthorized ownership, repeated action/concurrency where relevant, refresh/navigation, and browser console.

## Evaluation/learning rule

Every contributor must be able to trace their request/data flow, explain one failure case, justify one decision, and perform one small modification. AI-generated work must be reviewed, tested, understood, and independently recoded when it covers a pattern being learned.

## Dated implementation checkpoint — 17 September 2026

`main` is `3da8f33`. Auth/onboarding, the protected shell, `/home`, `/exercises`, the paginated catalog, shared Button/Card, and workout schema foundation exist. `/workouts` is not yet registered. Current S3 work is the protected Workouts route bridge, then the smallest custom-plan flow. Catalog recovery remains required before validation but is not the current blocker.
