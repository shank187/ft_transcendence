*This project has been created as part of the 42 curriculum by [aelbour, mouarar, sabadri, zyahansa, abel-had].*

---

## Description

`ft_transcendence` is a full-stack collaborative gym and fitness tracking platform. Designed as a modern multi-user web application, it allows users to discover local gyms, manage equipment and facilities, build customized workout plans, track live training sessions, and connect socially through friendships and real-time messaging.

---

## Instructions

### Prerequisites
- Docker & Docker Compose (v20+)

### Quick Start
To build and run the entire application stack (PostgreSQL database, Express backend, and React frontend) with a single command:

```bash
# Clone the repository
git clone <repository-url>
cd ft_transcendence

# Copy environment template
cp backend/.env.example backend/.env

# Build and start all containers
docker-compose up --build
```

- **Frontend Application:** http://localhost:5173
- **Backend API:** http://localhost:3000

---

## Team Information & Roles

Per the subject requirements, our team roles are distributed as follows:

* **aelbour — Technical Lead / Architect & Developer**
  * *Responsibilities:* Oversees technical architecture, manages the Docker containerization pipeline, defines core database schemas, and enforces code quality/reviews.
* **mouarar — Project Manager / Scrum Master & Developer**
  * *Responsibilities:* Coordinates task distribution, tracks deadlines, organizes synchronization meetings, and manages sprint planning.
* **sabadri — Product Owner (PO) & Developer**
  * *Responsibilities:* Defines product vision, manages the Trello product backlog, prioritizes feature delivery, and validates completed work.
* **zyahansa — Full-Stack Developer**
  * *Responsibilities:* Implements core authentication, user management, and backend API logic.
* **abel-had — Full-Stack Developer**
  * *Responsibilities:* Develops frontend UI components, responsive layouts, and feature views.

---

## Project Management

- **Asynchronous Tracking:** Trello board tracking backlog, sprint tasks, code reviews, and completed work.
- **Synchronous Communication:** Discord channel for daily alignment, technical syncs, and blocker removal.
- **Quality Control:** Mandatory peer code reviews via GitHub Pull Requests before merging into production.

---

## Technical Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database & ORM:** PostgreSQL 15, Prisma ORM
- **Deployment:** Docker & Docker Compose

---

## Database Schema

The database is centralized around PostgreSQL using Prisma ORM. Core entities include:

- **Identity:** User, Role, UserRole, Session
- **Gyms:** Gym, GymOpeningHour, Equipment, GymEquipment, Facility, GymFacility, GymReview
- **Workouts:** Exercise, WorkoutPlan, WorkoutDay, WorkoutExercise, WorkoutSession, WorkoutSet
- **Social:** Friendship, Conversation, ConversationMember, Message
- **Shared Infrastructure:** Notification, Media, ApiKey

---

## Modules Claimed (14+ Points Target)

- **Web (Major - 2 pts):** React frontend framework and Express backend framework.
- **Web - ORM (Minor - 1 pt):** Prisma ORM for type-safe database queries.
- **Web - Real-time Features (Major - 2 pts):** WebSockets for live chat and instant updates.
- **Web - User Interaction (Major - 2 pts):** Profiles, friend requests, and messaging.
- **User Management - Standard Authentication (Major - 2 pts):** Secure signup, login, hashed passwords, and sessions.
- **User Management - Advanced Permissions / Roles (Major - 2 pts):** Role-based access control via UserRole.
- **Web - File Upload (Minor - 1 pt):** Avatar uploads and document storage via Media.
- **Web - Advanced Search (Minor - 1 pt):** Filtering and sorting for gyms and exercises.
- **Web - Notification System (Minor - 1 pt):** System alerts for user activities.

**Total:** 14 Points.