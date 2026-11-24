# Scope and Validation Map

**Subject:** ft_transcendence v21.1  
**Target:** reliable 14-point validation before 16–20 November 2026  
**Rule:** mandatory requirements apply independently of module points.

## Product loop

```text
Discover Gym
  → Plan Workout
  → Train / Log Sets
  → Track Progress
  → Earn Achievements
  → Friends / Chat
  → Repeat
```

## Primary navigation

```text
Home · Gyms · Workouts · Progress · Social · Profile
```

## Core by slice

### S1 — Platform & Identity

Registration/login/logout, sessions, onboarding, own profile/avatar, OAuth, shared shell/navigation, validation/error conventions, HTTPS integration, Privacy/Terms, environment support, and multi-user correctness.

### S2 — Gym Discovery & Equipment

Gym catalog/details, canonical equipment, current gym, search, filters, sorting, pagination, and equipment availability exposed to S3.

Gym expansion approved on 31 Oct 2026: verified, unverified and private gyms, member submissions with photos, and admin review, with cutoffs Mon 9, Thu 12 and Sat 14 Nov.

### S3 — Workout Planning & Execution

Exercise catalog/types/muscles/equipment; search/filter; plans/days/planned exercises/sets; empty/planned session snapshots; type-aware performed sets; completion; workout history; basic PRs.

Second priority: previous values, add/replace active-session exercise. The rest time and rest timer were removed from S3 on 18 Nov to reduce scope. Advanced live reordering, complex supersets/circuits, advanced PRs, and recommended templates do not block core validation.

### S4 — Social & Real-Time

Public profile, friends, online/offline presence, basic chat, history, and WebSocket delivery. A social feed, posts, likes, and comments are not required.

### S5 — Progress & Gamification

Workout history presentation, weekly activity, applicable volume, basic PR overview/charts, exactly scoped XP/levels, achievements, and leaderboard based on S3 completed data.

Gamification is stored in `XpEvent` and `UserAchievement`.

## 14-point plan

| Module | Type | Points | Evidence owner |
|---|---:|---:|---|
| Frontend + Backend Frameworks | Major | 2 | Shared |
| ORM | Minor | 1 | Shared/database |
| Standard User Management | Major | 2 | S1 + S4 |
| User Interaction | Major | 2 | S4 |
| Real-Time Features | Major | 2 | S4 + S1 infrastructure |
| Advanced Search | Minor | 1 | S2 + S3 |
| Custom Design System | Minor | 1 | Shared frontend |
| Gamification | Minor | 1 | S5 |
| OAuth 2.0 | Minor | 1 | S1 |
| Two Additional Browsers | Minor | 1 | Shared QA |
| **Total** |  | **14** |  |

## Bonus claims — decided 24 November 2026

Claimed beyond the 14 and counted only after the 14 are validated.

| Module | Type | Points | Evidence owner |
|---|---:|---:|---|
| User activity analytics and insights dashboard | Minor | 1 | S5 + S3 (Home: weekly stats, next workout) |
| Module of choice: community gym database with moderation | Minor | 1 | S2 + S5 |

What each claim covers: README, "Bonus modules — beyond the 14".

## Mandatory gate

- Full-stack web application with frontend, backend, and database
- Docker/container deployment starts with one command
- Multiple simultaneous users without corruption/races
- Latest stable Chrome, responsive/accessibile UI, clean console
- Frontend and backend input validation
- Secure email/password authentication with hashing/salting
- HTTPS for browser/script/external API connections to backend
- Clear relational schema
- Ignored `.env` and committed non-secret `.env.example`
- Real, accessible Privacy Policy and Terms of Service
- Meaningful contributions/commits from all five members
- Complete English README with roles, management, stack, schema, features, modules, points, implementation, ownership, contributions, resources, and AI usage

## Out of scope

- AI/ML/RAG fitness assistant or exercise ranking
- Coaches, subscriptions, paid content
- Social feed/posts/likes/comments/communities
- Advanced workout templates/recommendation engine
- Complex circuits/supersets and broad live-session mutation
- Advanced analytics beyond selected module requirements
- Bonus PWA/i18n/RTL work

## Cross-slice contracts

- S1 supplies authenticated identity, session behavior, and shared error conventions.
- S2 supplies canonical equipment IDs and current-gym availability.
- S3 supplies completed session/set/history, applicable volume, and basic PR data.
- S5 consumes S3 data idempotently; it does not duplicate the source store.
- S4 supplies presence/chat/unread behavior to shared navigation/Home.

## Validation evidence rule

A label or implemented-looking schema is not evidence. Each claimed module needs a working demo, success/failure/ownership/repeated-action tests as applicable, clean browser behavior, documented implementation, accurate contributor evidence, and a teammate who can explain and modify it.

## Current implementation checkpoint — 24 November 2026

See the checkpoint in the README for what is on `main` (`22062eb`).

S3: core scope done (catalog, search and filters, plans, days, planned sets, empty and planned workouts, type-aware sets, finish, basic PRs, removing an exercise from a workout in progress, bodyweight PRs, imperial units). The rest time and rest timer were removed from S3 on 18 Nov to reduce scope. The workout history list moved to S5 (Progress) on 19 Nov.

S1/shared: Compose fails clearly when a required value is missing (JWT secrets included).
