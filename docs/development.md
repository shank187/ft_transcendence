# Development Guide

## 1. Development Model

The project uses vertical feature development.

A feature should be developed across the parts it requires:

- Frontend
- Backend
- Database
- Tests
- Documentation

Developers should build on the shared project architecture instead of creating independent systems.

---

## 2. Branches

Do not develop directly on `main`.

Create a branch for each task or feature.

Recommended format:

```text
feature/<feature-name>
fix/<issue-name>
chore/<task-name>
docs/<documentation-name>
```

Examples:

```text
feature/gym-discovery
feature/user-profile
fix/workout-session
chore/backend-setup
docs/api-conventions
```

Keep branches focused on one task or feature.

---

## 3. Commits

Use clear and meaningful commit messages.

Recommended format:

```text
<type>: <short description>
```

Examples:

```text
feat: add gym discovery endpoint
feat: add workout session tracking
fix: validate gym review input
chore: configure docker development environment
docs: update API documentation
```

Avoid meaningless messages such as:

```text
update
fix
stuff
changes
final
```

---

## 4. Pull Requests

Features should be merged through Pull Requests.

Before opening a Pull Request:

1. Make sure the project builds.
2. Make sure the relevant tests pass.
3. Make sure Prisma migrations are valid if the database changed.
4. Update relevant documentation.
5. Resolve merge conflicts.
6. Explain what was implemented.

Pull Requests should be reviewed before merging.

---

## 5. Frontend

The frontend uses:

- React
- Vite
- TypeScript

Frontend code belongs in:

```text
frontend/
```

The frontend communicates with the backend through the API.

The frontend must not access PostgreSQL or Prisma directly.

---

## 6. Backend

The backend uses:

- Node.js
- Express
- TypeScript

The backend starts from:

```text
backend/src/app.ts
backend/src/server.ts
```

The backend is responsible for:

- API routes
- Validation
- Application logic
- Authentication and authorization
- Database access
- Error handling

Feature-specific backend code should be organized consistently with the existing project structure.

---

## 7. Database

The database uses:

- PostgreSQL
- Prisma

The Prisma schema is located at:

```text
backend/prisma/schema.prisma
```

Feature developers must extend the shared schema.

Do not:

- Create another database
- Create another `User` entity
- Duplicate authentication/session systems
- Duplicate existing core entities

Database changes must use Prisma migrations.

Example:

```bash
npx prisma migrate dev --name <migration-name>
```

After modifying the schema, validate it:

```bash
npx prisma validate
```

Do not modify or delete existing migrations casually.

Structural changes affecting shared entities should be discussed before merging.

---

## 8. Environment Variables

Secrets and local configuration must not be committed.

Use:

```text
.env
```

for local values.

Use:

```text
.env.example
```

to document required variables without exposing real secrets.

Never commit:

```text
.env
```

or database credentials.

---

## 9. Docker

Docker Compose provides the shared local development environment.

Start the project with:

```bash
docker compose up --build
```

Stop it with:

```bash
docker compose down
```

The main services are:

```text
Frontend   → localhost:5173
Backend    → localhost:3000
PostgreSQL → localhost:5432
```

Developers should normally use the shared Docker environment rather than creating separate local infrastructure.

---

## 10. Feature Development

Before starting a feature:

1. Check its Trello card.
2. Read the acceptance criteria.
3. Check its dependencies.
4. Check the existing architecture.
5. Check the Prisma schema for reusable entities.
6. Create a branch.
7. Implement the feature vertically.
8. Test the feature.
9. Update documentation if necessary.
10. Open a Pull Request.

Do not start implementation by creating duplicate infrastructure.

---

## 11. Shared Architecture

The following are shared project foundations:

- Repository structure
- Docker environment
- Express application
- React application
- PostgreSQL database
- Prisma schema
- Authentication conventions
- API conventions
- Error handling
- Validation conventions

Changes to these foundations should be discussed with the Technical Lead before implementation or merging.

---

## 12. Trello and Development Status

Trello is the source of truth for feature/task progress.

Developers should keep their cards updated.

The expected flow is:

```text
Backlog
   ↓
To Do
   ↓
In Progress
   ↓
Review
   ↓
Done
```

A card should only be marked `Done` when its acceptance criteria are satisfied.

Dependencies between cards should be identified before implementation.

---

## 13. Vertical Feature Example

A workout feature may contain:

```text
Workout
│
├── Frontend
│   └── Workout pages/components
│
├── Backend
│   └── Workout routes/services
│
├── Database
│   └── Workout-related Prisma models
│
└── Tests
```

The feature should integrate with the existing:

```text
User
PostgreSQL
Prisma
Express
React
```

rather than creating independent systems.

---

## 14. Quality Rules

Before merging:

- TypeScript must compile.
- The application must build.
- Relevant functionality must be tested.
- No secrets should be committed.
- No unnecessary duplicate entities should be introduced.
- Database changes must have migrations.
- API changes should be documented when necessary.
- The implementation should follow the existing architecture.

The goal is to keep the shared codebase stable while allowing independent vertical feature development.