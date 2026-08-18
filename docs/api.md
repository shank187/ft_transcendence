# API

## 1. Overview

The backend exposes an HTTP API used by the frontend.

```text
Frontend
    │
    │ HTTP / WebSocket
    ▼
Backend
    │
    │ Application logic
    ▼
Prisma
    │
    ▼
PostgreSQL
```

The frontend must communicate with application data through the backend API.
The frontend must not access PostgreSQL directly.

---

## 2. Base URL

All application API endpoints use:

`/api`

Examples:
- `/api/auth`
- `/api/users`
- `/api/gyms`
- `/api/workouts`

The exact endpoint structure may evolve as features are implemented.

---

## 3. HTTP Methods

Use HTTP methods according to the operation being performed.

| Method | Purpose |
|---|---|
| **GET** | Retrieve data |
| **POST** | Create a resource or perform an action |
| **PUT** | Replace an existing resource |
| **PATCH** | Partially update a resource |
| **DELETE** | Delete a resource |

Examples:
```http
GET    /api/gyms
GET    /api/gyms/:id
POST   /api/gyms
PATCH  /api/gyms/:id
DELETE /api/gyms/:id
```

---

## 4. Resource-Based Endpoints

Endpoints should generally be organized around resources.

Examples:
- `/api/users`
- `/api/gyms`
- `/api/exercises`
- `/api/workouts`
- `/api/friends`
- `/api/messages`

Avoid creating arbitrary endpoint structures when an existing resource-based structure is appropriate. Feature developers should follow the same convention when adding endpoints.

---

## 5. Authentication

Authentication is handled by the backend. Protected endpoints must verify that the request is associated with an authenticated user.

Example:
```http
POST /api/auth/login
POST /api/auth/logout
GET  /api/users/me
```

Authentication details should not be duplicated inside individual features. Feature developers should use the existing authentication mechanism.

---

## 6. Authorization

Authentication answers: *Who is making the request?*
Authorization answers: *Is this user allowed to perform this operation?*

Protected resources must verify authorization on the backend.

For example:
```text
User A
  │
  │ PATCH /api/users/UserB
  ▼
Backend
  │
  └── Reject request
```

A user must not be able to access or modify another user's private data simply by changing an ID in the request. Authorization must be enforced by the backend and must not rely only on frontend restrictions.

---

## 7. Request Validation

All external input must be validated by the backend. This includes:
- Request body
- Query parameters
- URL parameters
- Authentication-related input
- Uploaded data when applicable

Frontend validation may be used to improve user experience, but it does not replace backend validation.

Example flow:
```text
Frontend validation
        ↓
      Backend
        ↓
Backend validation
        ↓
Application logic
```

Invalid input should be rejected before it reaches business logic or the database.

---

## 8. Request Parameters

**Path parameters**
Use path parameters when identifying a specific resource.
```http
GET /api/gyms/:id
```
Example: `GET /api/gyms/123`

**Query parameters**
Use query parameters for filtering, searching, sorting, or pagination.
Example: `GET /api/gyms?city=Khouribga`

**Request body**
Use the request body for data being created or updated.
Example:
```http
POST /api/gyms
```
```json
{
  "name": "Example Gym",
  "city": "Khouribga"
}
```

---

## 9. Responses

API responses use JSON.

Example:
```json
{
  "id": "123",
  "name": "Example Gym",
  "city": "Khouribga"
}
```

Collections should return a consistent structure.
Example:
```json
{
  "data": [],
  "meta": {
    "total": 0
  }
}
```

The exact response structure can be refined as the API is implemented, but the same convention should be used consistently across features.

---

## 10. HTTP Status Codes

Use appropriate HTTP status codes.

| Status | Meaning |
|---|---|
| **200** | Successful request |
| **201** | Resource successfully created |
| **204** | Successful request with no response body |
| **400** | Invalid request |
| **401** | Authentication required |
| **403** | Authenticated but not authorized |
| **404** | Resource not found |
| **409** | Resource conflict |
| **422** | Validation error |
| **500** | Internal server error |

Examples:
- `GET /api/gyms/123` → **200**
- `POST /api/gyms` → **201**
- `GET /api/gyms/unknown` → **404**
- Unauthenticated request → **401**
- Authenticated but unauthorized request → **403**

---

## 11. Error Responses

Errors should use a consistent JSON structure.

Example:
```json
{
  "error": "Resource not found"
}
```

Validation errors may provide additional information:
```json
{
  "error": "Validation failed",
  "details": {
    "name": "Name is required"
  }
}
```

**Do not** expose sensitive implementation details, database errors, passwords, tokens, or internal stack traces to the client.

---

## 12. API Layer Structure

Backend API requests should follow a clear responsibility flow:

```text
HTTP Request
     │
     ▼
   Route
     │
     ▼
 Controller
     │
     ▼
 Validation
     │
     ▼
 Service / Business Logic
     │
     ▼
   Prisma
     │
     ▼
 PostgreSQL
```

The exact directory structure may evolve, but responsibilities should remain separated:
- **Routes:** Define the HTTP endpoints.
- **Controllers:** Handle HTTP-specific concerns such as reading request data, calling application logic, and returning HTTP responses. Controllers should not contain large amounts of database or business logic.
- **Services:** Contain application/business logic.
- **Prisma:** Used for database access.

---

## 13. Example Feature

A gym feature might expose:
```http
GET    /api/gyms
GET    /api/gyms/:id
POST   /api/gyms
PATCH  /api/gyms/:id
DELETE /api/gyms/:id

GET    /api/gyms/:id/reviews
POST   /api/gyms/:id/reviews
```

The implementation follows:
```text
React
  │
  │ GET /api/gyms
  ▼
Express Route
  │
  ▼
Controller
  │
  ▼
Gym Service
  │
  ▼
Prisma
  │
  ▼
PostgreSQL
```
The same principle applies to other features.

---

## 14. Feature Ownership

Feature developers are responsible for the API endpoints required by their feature.

For example:
- Gym feature → `/api/gyms`
- Workout feature → `/api/workouts`
- Social feature → `/api/friends`, `/api/messages`

Feature developers should follow the shared API conventions instead of creating independent API patterns. Shared authentication, authorization, error handling, or API conventions should not be independently reimplemented by features.

---

## 15. Database Boundary

The API is the boundary between the frontend and the database.

**Correct:**
```text
React
  ↓
Express API
  ↓
Service
  ↓
Prisma
  ↓
PostgreSQL
```

**Incorrect:**
```text
React
  ↓
PostgreSQL
```

The frontend must never contain database credentials or direct database connections.

---

## 16. WebSockets

WebSockets may be used for features requiring real-time communication.
Examples may include:
- Real-time messaging
- Live notifications
- Other real-time application functionality

WebSockets should only be introduced where real-time communication is actually required. HTTP remains the default communication mechanism for normal CRUD operations.

---

## 17. Pagination

Endpoints returning potentially large collections should support pagination when required.

Example:
```http
GET /api/gyms?page=1&limit=20
```

The exact pagination implementation should be consistent across endpoints that require it.

---

## 18. Filtering and Searching

Filtering and searching should use query parameters.

Example:
```http
GET /api/gyms?city=Khouribga
```

Example with multiple filters:
```http
GET /api/gyms?city=Khouribga&verified=true
```

Feature-specific filters should be documented with their endpoint.

---

## 19. API Documentation

As features are implemented, their endpoints should be added to this document. For each endpoint, document:
- HTTP method
- Path
- Authentication requirement
- Parameters
- Request body
- Successful response
- Possible errors

**Example:**

### `GET /api/gyms/:id`

**Authentication:** Required

**Parameters:**
- `id` — Gym identifier

**Response:**
```json
{
  "id": "123",
  "name": "Example Gym"
}
```

**Possible responses:**
- `200` — Success
- `401` — Authentication required
- `404` — Gym not found

---

## 20. API Principles

- **Backend Boundary:** The backend is the only application layer that communicates with the database.
- **Validation:** All external input is validated by the backend.
- **Authorization:** Every protected resource must enforce authorization.
- **Consistency:** Features should follow the same API conventions.
- **Separation of Responsibilities:** Routes, controllers, business logic, and database access should remain separated.
- **Reusability:** Shared authentication, validation, error handling, and infrastructure should be reused rather than duplicated.
- **Documentation:** New endpoints should be documented when they are introduced.