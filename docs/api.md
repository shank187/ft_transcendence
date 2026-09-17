# API Contract

## Status rule

This file separates implemented endpoints from frozen target contracts. `backend/src/app.ts` and module route files are authoritative for what currently exists.

## Base path and transport

- API prefix: `/api`
- JSON request/response bodies
- External/browser traffic must use HTTPS in the validated deployment
- Credentials/cookies are sent only according to the shared auth configuration

## Implemented endpoint inventory — 17 September 2026

| Method | Path | Auth | Purpose |
|---|---|---:|---|
| POST | `/api/auth/register` | No | Create email/password account |
| POST | `/api/auth/login` | No | Authenticate |
| POST | `/api/auth/refresh` | Refresh/session contract | Refresh access state |
| POST | `/api/auth/logout` | Session contract | End/revoke auth state |
| PATCH | `/api/users/onboarding` | Yes | Save onboarding fields |
| GET | `/api/exercises` | Yes | Return paginated canonical exercises |

Do not document `/api/users/me`, workout, gym, progress, social, or chat endpoints as implemented until their routes are merged.

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

S1 must finalize one consistent error DTO. Until then, do not invent a second per-feature shape. The intended minimum is:

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

## Frozen S3 target resources

Design the smallest coherent REST contract around:

- owned custom plans and days;
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
