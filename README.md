# FT Transcendence

A full-stack collaborative gym and fitness tracking platform developed as part of the 42 ft_transcendence project.
The application allows users to discover gyms, manage workout plans, track workouts, interact socially, and use additional fitness-related features.

---

## Tech Stack

### Frontend

- React
- Vite
- TypeScript

### Backend

- Node.js
- Express
- TypeScript

### Database

- PostgreSQL
- Prisma ORM

### Infrastructure

- Docker
- Docker Compose

---

## Project Structure

```text
ft_transcendence/
│
├── frontend/
│   └── React + Vite + TypeScript application
│
├── backend/
│   ├── src/
│   │   ├── app.ts
│   │   └── server.ts
│   │
│   └── prisma/
│       ├── schema.prisma
│       └── migrations/
│
├── docs/
│   ├── architecture.md
│   ├── api.md
│   ├── database.md
│   └── development.md
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites

- Docker
- Docker Compose
- Git

### Clone the repository

```bash
git clone <repository-url>
cd ft_transcendence
```

### Start the project

```bash
docker compose up --build
```

The development environment starts:

- PostgreSQL → localhost:5432
- Backend → localhost:3000
- Frontend → localhost:5173

### Backend health check

Open:

```
http://localhost:3000/api/health
```

The endpoint verifies that the backend can communicate with PostgreSQL.

---

## Development

The project uses a shared architecture with vertical feature development.
Each feature may contain:

- Frontend UI
- Backend routes/controllers
- Business logic
- Feature-specific database models
- Tests
- Documentation

Feature developers must reuse the shared core rather than creating independent applications or databases.

See:

- `docs/architecture.md`
- `docs/api.md`
- `docs/database.md`
- `docs/development.md`

---

## Database

PostgreSQL is accessed through Prisma.
The Prisma schema is located at:

```
backend/prisma/schema.prisma
```

Core domains currently include:

- Identity
- Gyms
- Workouts
- Social
- Shared infrastructure

Feature developers may extend the schema when their feature requires additional entities.
Do not create duplicate `User`, authentication, or database systems.

---

## Project Management

The team uses:

- Trello for backlog and sprint management
- GitHub for source control and Pull Requests
- Discord for team communication
- Docker for the shared development environment

Development follows a vertical-slice approach so that features can be developed across the frontend, backend, and database while sharing the same core architecture.

---

## Team

The project team and official project roles are maintained according to the agreed team organization and 42 subject requirements.
Technical responsibilities include maintaining:

- Shared architecture
- Core database foundation
- Development environment
- Technical conventions
- Documentation
- Code quality

Feature ownership is handled through the project's vertical development workflow.

---

## Targeted 42 Modules

The project targets the required subject modules and additional modules agreed by the team.
The exact module selection and point calculation should be maintained according to the official subject requirements and the team's Trello backlog.

---

## Important Rules

- Do not commit `.env` files.
- Do not commit database credentials or secrets.
- Do not create duplicate core entities.
- Do not access PostgreSQL directly from the frontend.
- Use Prisma for normal database access.
- Discuss structural changes to the shared architecture before merging.
- Use Git branches and Pull Requests for feature development.