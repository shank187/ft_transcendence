# AGENTS.md — ft_transcendence

## Project context

This repository is a 42 Common Core `ft_transcendence` project.

Tech stack:
- Frontend: React + Vite + TypeScript
- Backend: Express + TypeScript
- Database: PostgreSQL
- ORM: Prisma
- Deployment: Docker / Docker Compose

The current `ft_transcendence` subject is the source of truth for project requirements.
Do not invent requirements or assume old versions of the subject.

## Main goals

1. Keep the project correct, maintainable, secure, and explainable.
2. Help the team finish the project without creating code that team members do not understand.
3. Prefer simple, explicit architecture over unnecessary abstractions.
4. Preserve clear ownership and meaningful Git history for every team member.
5. Keep all changes compatible with the project subject and evaluation expectations.

## Working style

Default behavior:
- Inspect first.
- Explain the problem before editing.
- Make the smallest reasonable change.
- Do not rewrite unrelated code.
- Do not add dependencies unless necessary.
- Do not make broad architectural changes without explaining the trade-offs first.
- Prefer incremental implementation over large generated features.
- When asked to review, do not modify files unless explicitly requested.
- When asked to implement, state which files you expect to modify before editing.
- After editing, summarize exactly what changed and why.

For significant features, explain:
- what problem the feature solves
- request/data flow
- important abstractions
- failure cases
- security implications
- design trade-offs

## Review format

When reviewing code, classify findings as:

### BLOCKING
Correctness, security, data-loss, broken requirements, race conditions, invalid database design, or changes that can make the project fail evaluation.

### IMPORTANT
Maintainability, weak error handling, poor TypeScript usage, unclear API design, duplicated logic, fragile architecture, or missing important tests.

### OPTIONAL
Naming, small refactors, code style improvements, or non-essential optimizations.

Explain the issue before suggesting a fix.

## TypeScript rules

- Prefer precise types over `any`.
- Avoid unsafe casts unless justified.
- Keep DTO/request types separate from database models when their responsibilities differ.
- Validate runtime input even when TypeScript types exist.
- Handle nullable and optional values explicitly.
- Prefer exhaustive handling of enums/unions when appropriate.
- Do not hide type errors with broad casts.

## Backend / Express rules

- Keep routing, validation, business logic, and persistence responsibilities clear.
- Validate all user-controlled input on the backend.
- Return intentional HTTP status codes and consistent error responses.
- Do not expose internal errors, stack traces, secrets, or sensitive database information.
- Treat authentication and authorization as separate concerns.
- Check authorization at the backend even if the frontend hides an action.
- Avoid trusting IDs, ownership claims, roles, or other security-sensitive values from the client.

## Prisma / PostgreSQL rules

Before changing `schema.prisma`:
1. Explain the relationship being modeled.
2. Identify ownership and foreign keys.
3. Consider deletion behavior and historical data.
4. Consider uniqueness constraints and indexes.
5. Consider nullability and lifecycle.

Do not:
- silently change relations
- silently change `onDelete` behavior
- edit old migrations unless explicitly requested
- destroy or reset data without explicit approval
- generate migrations for speculative schema changes

After schema changes, run when applicable:

```bash
npx prisma format
npx prisma validate
```

Explain migration consequences before running destructive operations.

## Authentication / security rules

- Never commit `.env`, credentials, API keys, tokens, or secrets.
- Keep `.env.example` free of real secrets.
- Passwords must never be stored in plaintext.
- Validate authentication state on the backend.
- Validate authorization for protected resources.
- Treat all browser input as untrusted.
- Consider ownership checks for user-owned resources.
- Consider concurrent requests where data consistency matters.
- Do not weaken security merely to make development easier.

## Frontend rules

- Keep components focused and reusable where reuse is real.
- Avoid putting business rules only in the frontend.
- Handle loading, empty, success, and error states.
- Do not assume backend requests always succeed.
- Keep API contracts typed.
- Avoid unnecessary global state.
- Keep accessibility and responsive behavior in mind.

## Docker / environment rules

- Do not hard-code environment-specific values.
- Preserve the ability to run the project with the documented container workflow.
- Do not expose unnecessary ports or secrets.
- Distinguish host, container, and Docker-network addresses correctly.
- Do not make local-only fixes that break containerized execution.

## Git rules

Before significant edits:
- inspect the current branch
- inspect `git status`
- avoid touching unrelated teammate work

Do not:
- force-push
- reset branches
- delete branches
- discard uncommitted work
- commit automatically

unless explicitly requested.

Prefer small, meaningful changes that can be reviewed independently.

## Testing and verification

After a change, run the narrowest relevant verification first.

Typical checks:

```bash
npm run build
npx prisma format
npx prisma validate
git diff
git status
```

Use repository-specific lint/test commands when they exist.

When something fails:
- report the exact failing command
- explain the likely root cause
- do not hide or bypass the failure just to make the command pass

## 42 / evaluation constraints

AI-generated output must remain understandable by the team.

Do not optimize for "code that works" at the cost of explainability.

Assume evaluators may ask a team member to:
- explain request flow
- explain a database relation
- justify a technical choice
- identify a failure case
- modify a small behavior live

Prefer designs the team can defend and modify during evaluation.

## Default Codex modes

### Inspection request
When asked to inspect:
- do not modify files
- map the relevant architecture
- identify blocking issues first
- cite exact files/functions/models involved

### Review request
When asked to review:
- do not rewrite automatically
- classify findings as BLOCKING / IMPORTANT / OPTIONAL
- explain why each issue matters

### Implementation request
When asked to implement:
1. restate the intended behavior briefly
2. list files likely to change
3. make the smallest coherent change
4. run relevant validation/tests
5. summarize the diff
6. mention remaining risks or edge cases


