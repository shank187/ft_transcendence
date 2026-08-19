# Architecture

## 1. Overview

FT Transcendence is organized into three main layers, running entirely inside Docker, satisfying the single-command startup requirement (`docker-compose up --build`).

```text
┌─────────────────────────────┐
│          Frontend           │
│    React + Vite (SPA)       │
└──────────────┬──────────────┘
               │
               │ HTTP / WebSocket
               ▼
┌─────────────────────────────┐
│           Backend           │
│         Express + JS        │
└──────────────┬──────────────┘
               │
               │ Prisma ORM
               ▼
┌─────────────────────────────┐
│          Database           │
│         PostgreSQL          │
└─────────────────────────────┘
```

The frontend is responsible for the user interface, managing client-side state as a Single Page Application (SPA), and communicating with the backend.
The backend is responsible for the HTTP API, application logic, authentication, and database security.
Prisma is used by the backend as the ORM (Object-Relational Mapper) to safely query PostgreSQL and prevent SQL injection.
PostgreSQL stores the application's persistent data in a centralized, secure volume.

## 2. Repository Structure

```text
ft_transcendence/
│
├── frontend/
│   └── React application (SPA)
│
├── backend/
│   ├── Express application
│   └── Prisma schema & migrations
│
├── docs/
│   └── Project documentation
│
├── .gitignore
├── docker-compose.yml
└── README.md
```

### Frontend
The `frontend/` directory contains the React application.
It is responsible for:
- User interface and SPA routing
- Components and Client-side state
- Communication with the backend API
- Real-time communication with the backend via WebSockets

### Backend
The `backend/` directory contains the Express application and Prisma configuration.
It is responsible for:
- HTTP REST API
- Authentication and authorization (JWT)
- Application/business logic
- Input validation and Error Handling
- Database access
- Real-time WebSocket event handling

### Docs
The `docs/` directory contains technical documentation describing the architecture, database, API, and development conventions.

## 3. Communication Flow

A normal HTTP REST request follows this path:

```text
User
 │
 ▼
React (Frontend)
 │
 │ HTTP Request (Axios/Fetch)
 ▼
Express (Backend)
 │
 │ Validate & process logic
 ▼
Prisma (ORM)
 │
 │ Execute safe SQL
 ▼
PostgreSQL (Database)
 │
 │ Return Result
 ▼
Prisma
 │
 ▼
Express
 │
 │ HTTP JSON Response
 ▼
React
 │
 ▼
User
```

The frontend never communicates directly with PostgreSQL. All data requests must pass through the Express backend to ensure proper authorization and security.

## 4. Real-Time Communication

Some application features (such as the Chat and Social modules) require real-time communication.
For these features, the frontend and backend maintain a persistent WebSocket connection. This ensures instant updates without the user needing to refresh the page.

```text
Frontend (React)
   ║
   ║ WebSocket (e.g., Socket.io)
   ║
Backend (Express)
```

## 5. Feature Organization (Vertical Slicing)

The application is organized as one shared architecture, but development is structured around feature-based development (Vertical Slicing).
The core architecture (Docker, Prisma connection, Express shell) is shared. However, feature developers own their modules from the database all the way to the UI.

A vertical feature slice contains:
- Frontend UI components and routes
- Backend routes and controllers
- Feature-specific database models (in `schema.prisma`)

Example for the Workout module:

```text
Workout Feature
    │
    ├── React UI (Workout Dashboard)
    ├── Express Routes (`/api/workouts`)
    ├── Controllers & Logic
    └── Prisma Models (WorkoutPlan, WorkoutSession)
```

## 6. Architectural Principles

- **Single Application & Containerization:** The project is developed in one Git repository and launched via a single `docker-compose.yml` file.
- **Shared Database:** All features use the same PostgreSQL database container.
- **Backend as the Data Boundary:** The frontend does not access PostgreSQL directly. The backend validates all inputs.
- **Clear Separation of Responsibilities:** Each layer has a specific responsibility:
  - **Frontend** → Interface, routing, and user interaction
  - **Backend** → API, business logic, and security
  - **Prisma** → Type-safe database queries
  - **PostgreSQL** → Persistent relational data
- **Documentation:** Important architectural and technical decisions are documented so that every team member understands the codebase for the final evaluation defense.