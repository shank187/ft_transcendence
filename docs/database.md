# Development Workflow

## One bounded task

Start from one acceptance criterion, not an entire slice.

```text
inspect → understand contract → implement smallest vertical step → verify → peer review → document → explain/recode
```

## Before coding

```bash
git fetch origin --prune
git status -sb
git branch --show-current
git rev-parse --short HEAD
```

- Start from the current shared base agreed by the team.
- Preserve uncommitted and teammate work.
- Confirm Trello ownership and dependencies.
- Inspect executable sources before trusting dated documentation.
- Use a focused branch such as `feature/workouts-home`.

After the 17 September history cleanup, teammates with old clones must resynchronize with cleaned `main` before pushing. Do not merge old secret-containing history back into active branches.

## Vertical slice standard

A meaningful feature normally crosses:

```text
React UI → API request → Express route/controller → service rule → Prisma → PostgreSQL → response/UI state
```

Do not build broad layers with no user-visible/testable flow.

## Pull requests

- One coherent behavior per PR where practical
- Explain problem, scope, affected contract, verification, and remaining risk
- Keep unrelated formatting/refactors out
- Request peer review for security, auth, schema, transactions, shared UI, and cross-slice DTOs
- Do not claim tests/build/runtime checks that were not run

## Environment and secrets

- `.env` stays local and ignored.
- `.env.example` lists required names but contains no real credentials.
- Public port numbers and service names are normally safe configuration.
- Passwords, JWT keys, tokens, API keys, certificates/private keys, and deployment credentials are secrets.
- A bootstrap command may create `.env` once but must not overwrite existing values.
- Compose must fail clearly when required security values are absent; do not rely on `change_me` fallbacks.

S1/shared owns the bootstrap, Compose injection, and CI/Gitleaks implementation. The Technical Lead reviews the contract without absorbing ownership.

## Verification matrix

For each flow, test only relevant rows but cover deliberate behavior:

| Area | Checks |
|---|---|
| Build/static | frontend build/lint, backend TypeScript build, Prisma validate |
| Happy path | expected request, persistence, render/navigation |
| Input failure | empty/malformed/out-of-range data |
| Auth | unauthenticated and expired/invalid state |
| Ownership | user A cannot access/mutate user B resource |
| Lifecycle | closed/completed resource rejects invalid mutation |
| Repetition | double-click/retry/repeated completion is safe |
| Concurrency | simultaneous starts/reorders/completion where relevant |
| UX | loading, error, empty, success, final state, refresh |
| Browser | Chrome console clean; Firefox/Edge module evidence |

Typical commands:

```bash
cd frontend && npm run build && npm run lint
cd backend && npm run build && npm run prisma:validate
docker compose config
git diff --check
git status -sb
```

## Learning/evaluation loop

For every significant pattern:

1. Build the bounded real feature.
2. Trace the request/data flow.
3. Explain one failure case and one design decision.
4. Recode the important mechanism from a blank scratch example without copying.
5. Practice one small requirement change.

Use AI for bounded explanation/review and verify its output. Do not merge code a contributor cannot explain or modify.

## Priority language

- **Must finish before 16–20 November:** frozen core, 14-point modules, mandatory requirements, integration/security correctness
- **Should finish:** work directly supporting validation, integration, documentation, or evaluation evidence
- **Defer:** bonuses and polish that do not remove a core blocker

## Current S3 order — dated 17 September 2026

1. Protected `/workouts` page and route bridge
2. Working Workouts entry points and smallest owned custom-plan flow
3. Plan/day/exercise/set planning vertical slice
4. Empty/planned session start with snapshot and ownership
5. Type-aware set logging/completion
6. History/basic PR completion contract with S5
7. Required catalog recovery/search hardening before final validation

Re-estimate from live GitHub/Trello evidence; this order is not permission to implement multiple steps at once.
