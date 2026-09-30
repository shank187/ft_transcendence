# API Contract

## Status rule

This file separates implemented endpoints from frozen target contracts. `backend/src/app.ts` and module route files are authoritative for what currently exists.

## Base path and transport

- API prefix: `/api`
- JSON request/response bodies
- External/browser traffic must use HTTPS in the validated deployment
- Credentials/cookies are sent only according to the shared auth configuration

## Implemented endpoint inventory — 30 September 2026

Source: `backend/src/app.ts` and module route files on `feature/workout-plans-get` (`main` at `177c75a` plus the workout-plans read route).

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
| GET | `/api/workout-plans` | Yes | List the authenticated user's own workout plans |

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

`GET /api/exercises` is authenticated and paginated. The exact DTO must be read from the current controller/service/types before changing it.

Required validation hardening before final QA:

- missing `page`/`limit` uses documented defaults;
- invalid or repeated shapes receive `400`;
- initial failure can retry without reload;
- later-page failure retains loaded cards and retries the failed page;
- overlapping/repeated requests cannot duplicate/corrupt results;
- final-page controls are deliberate.

## Workout plans

### `GET /api/workout-plans`

Lists the plans owned by the authenticated user. Used by the `/workouts` page (`frontend/src/features/workouts/workout.api.tsx`).

- **Auth:** required (Bearer access token).
- **Request:** no path, query, or body parameters. Pagination is not implemented.
- **Ownership:** the service filters `WorkoutPlan.userId = req.userId`. The browser never sends a user ID. Plans with `userId = null` (reserved for `RECOMMENDED` plans) are not returned.
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
| `type` | `"CUSTOM"` \| `"RECOMMENDED"` | `WorkoutPlanType`; owned plans are normally `CUSTOM` |
| `days` | number | Count of `WorkoutDay` rows, not the day objects |

Status codes:

- `200` list returned (possibly `[]`)
- `401` missing, invalid, or expired access token — e.g. no `Authorization` header returns `{ "message": "Access token is required" }`
- `500` unexpected server/database error (no feature-specific error body yet)

Frontend type: `WorkoutPlan` in `frontend/src/features/workouts/workout.types.tsx` must stay in sync with this DTO.

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
