# Architecture

## 1. Overview

FT Transcendence is organized as a single full-stack application with three main layers:

```text
┌─────────────────────────────┐
│          Frontend           │
│   React + Vite + TypeScript │
└──────────────┬──────────────┘
               │
               │ HTTP / WebSocket
               ▼
┌─────────────────────────────┐
│           Backend           │
│     Express + TypeScript    │
└──────────────┬──────────────┘
               │
               │ Prisma ORM
               ▼
┌─────────────────────────────┐
│          Database           │
│         PostgreSQL          │
└─────────────────────────────┘

The frontend is responsible for the user interface and client-side application logic.
The backend is responsible for the API, application/business logic, authentication and authorization, validation, and database access.
Prisma is used by the backend as the ORM for PostgreSQL.
PostgreSQL stores the application's persistent data.
The application is developed in one Git repository and uses Docker Compose for the local development environment.

## 2. Technology Stack

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

### Development Infrastructure

- Docker
- Docker Compose
- Git
- GitHub

## 3. Repository Structure

```
ft_transcendence/
│
├── frontend/
│   └── React + Vite application
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

## 4. Application Layers

### Frontend

The frontend/ directory contains the React application.
It is responsible for:

- User interface
- Pages and components
- Client-side state
- Client-side routing
- Communication with the backend API
- Real-time communication when required

The frontend must never communicate directly with PostgreSQL.

### Backend

The backend/ directory contains the Express application and Prisma configuration.
It is responsible for:

- HTTP API
- Authentication and authorization
- Application/business logic
- Input validation
- Error handling
- Database access
- Real-time communication when required

The backend is the application's data access boundary.

### Database

PostgreSQL is the shared relational database.
Prisma is used by the backend as the ORM.
The schema is defined in:

`backend/prisma/schema.prisma`

Database migrations are stored in:

`backend/prisma/migrations/`

Feature developers extend the shared schema instead of creating separate databases or duplicated core entities.

## 5. Communication Flow

A normal request follows this path:

```text
User
 │
 ▼
React
 │
 │ HTTP request
 ▼
Express
 │
 │ Application logic
 ▼
Prisma
 │
 │ Database query
 ▼
PostgreSQL
 │
 │ Result
 ▼
Prisma
 │
 ▼
Express
 │
 │ JSON response
 ▼
React
 │
 ▼
User
```

The frontend does not communicate directly with PostgreSQL.

## 6. Backend Structure

The backend starts with a small shared foundation:

```
backend/
│
├── src/
│   ├── app.ts
│   └── server.ts
│
└── prisma/
    ├── schema.prisma
    └── migrations/
```

### app.ts

Creates and configures the Express application.
It is responsible for:

- Express initialization
- Middleware
- Shared configuration
- Route registration

### server.ts

Starts the HTTP server.
Keeping server startup separate from the Express application makes the application easier to test and extend.

## 7. Feature Organization

The application uses vertical feature development.
A feature may contain:

- Frontend UI
- Backend routes
- Controllers
- Business logic/services
- Feature-specific database models
- Tests
- Documentation

Example:

```
Workout Feature
    │
    ├── React UI
    ├── Express routes
    ├── Controllers / services
    └── Prisma models
```

Feature developers should reuse the shared core architecture instead of creating independent applications or databases.

## 8. Shared Core

The project has a shared technical foundation maintained centrally.
This includes:

- Repository structure
- Docker development environment
- PostgreSQL
- Prisma
- Core database models
- Express application foundation
- React application foundation
- Shared API conventions
- Authentication conventions
- Validation conventions
- Error-handling conventions

Feature developers should build on top of these foundations.
Structural changes to shared infrastructure should be discussed before merging.

## 9. Real-Time Communication

Some features may require real-time communication, such as messaging or live application updates.
For these features, the frontend and backend may maintain a persistent WebSocket connection.

```text
Frontend
    ║
    ║ WebSocket
    ║
Backend
```

The exact WebSocket library and implementation should be introduced when the corresponding feature is developed.
Real-time communication should not be added to features that do not require it.

## 10. Architectural Principles

### Single Application

The project is developed as one application in one Git repository.

### Shared Database

All features use the same PostgreSQL database.

### Backend Data Boundary

The frontend never accesses PostgreSQL directly.

### Shared Identity

The application uses one central user identity system.
Features must reuse the existing User entity.

### Feature-Based Development

Features are developed vertically while sharing the common architecture.

### Separation of Responsibilities

- Frontend → UI and user interaction
- Backend → API and application logic
- Prisma → Database access
- PostgreSQL → Persistent data

### Documentation

Important architectural and technical decisions should be documented so that every team member can understand and follow the shared architecture.