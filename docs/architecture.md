# Architecture

## 1. Overview

FT Transcendence is organized into three main layers:

```text
┌─────────────────────────────┐
│          Frontend           │
│      React + Vite + TS      │
└──────────────┬──────────────┘
               │
               │ HTTP / WebSocket
               ▼
┌─────────────────────────────┐
│           Backend           │
│       Express + TS          │
└──────────────┬──────────────┘
               │
               │ Prisma
               ▼
┌─────────────────────────────┐
│          Database           │
│         PostgreSQL          │
└─────────────────────────────┘
```

The frontend is responsible for the user interface and communicating with the backend.
The backend is responsible for the API, application logic, authentication, and communication with the database.
Prisma is used by the backend as the ORM for accessing PostgreSQL.
PostgreSQL stores the application's persistent data.

## 2. Repository Structure

```text
ft_transcendence/
│
├── frontend/
│   └── React application
│
├── backend/
│   ├── Express application
│   └── Prisma
│
├── docs/
│   └── Project documentation
│
├── .gitignore
├── docker-compose.yml
└── README.md
```

**Frontend**
The `frontend/` directory contains the React application.
It is responsible for:
* User interface
* Pages
* Components
* Client-side state
* Communication with the backend API
* Real-time communication with the backend when required

**Backend**
The `backend/` directory contains the Express application and Prisma configuration.
It is responsible for:
* HTTP API
* Authentication and authorization
* Application/business logic
* Input validation
* Database access
* Real-time communication

**Docs**
The `docs/` directory contains technical documentation describing the architecture, database, API, and development conventions.

## 3. Communication Flow

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
 │ HTTP response
 ▼
React
 │
 ▼
User
```

The frontend does not communicate directly with PostgreSQL.
The frontend communicates with the backend, and the backend communicates with PostgreSQL through Prisma.

## 4. Frontend ↔ Backend

The frontend communicates with the backend through an API.
Example:

```text
React
  │
  │ GET /api/gyms
  ▼
Express
  │
  │ query database
  ▼
PostgreSQL
```

The backend returns data to the frontend:

```text
PostgreSQL
  │
  ▼
Express
  │
  │ JSON response
  ▼
React
```

The API contract will be documented separately in `docs/api.md`.

## 5. Backend ↔ Database

The backend does not directly build SQL queries for normal database operations.
Prisma acts as the ORM between the Express application and PostgreSQL.

```text
Express
   │
   ▼
Prisma
   │
   ▼
PostgreSQL
```

The database schema will be defined using Prisma and documented in `docs/database.md`.

## 6. Real-Time Communication

Some application features may require real-time communication.
For these features, the frontend and backend can maintain a persistent WebSocket connection.

```text
Frontend
    ║
    ║ WebSocket
    ║
Backend
```

The exact real-time features and implementation details will be documented when the corresponding modules are defined.

## 7. Feature Organization

The application will be divided into feature modules.
The final feature ownership and module boundaries will be defined before development starts.
Each feature should remain organized so that its frontend, backend, and database responsibilities can be identified clearly.
The shared architecture should allow multiple team members to work on different features without creating separate applications or databases.

## 8. Architectural Principles

**Single application**
The project is developed as one application in one Git repository.

**Shared database**
All features use the same PostgreSQL database.

**Backend as the data access boundary**
The frontend does not access PostgreSQL directly.

**Clear separation of responsibilities**
Each layer has a specific responsibility:
* Frontend  → Interface and user interaction
* Backend   → API and application logic
* Prisma    → Database access
* PostgreSQL → Persistent data

**Feature-based development**
Features will be developed as independent modules while using the shared application architecture.

**Documentation**
Important architectural and technical decisions should be documented so that every team member can understand and follow the same structure.