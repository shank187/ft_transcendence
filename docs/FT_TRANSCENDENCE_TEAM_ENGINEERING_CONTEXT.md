# ft_transcendence — Team Engineering & AI-Agent Context

> **Purpose:** Shared engineering context for all five team members and any AI assistant/agent used on the project.
>
> Add this file to the repository and also attach it to ChatGPT Projects, Codex/agent context, Claude Projects, or other coding-agent context.
>
> **Important:** This file defines the working method, ownership boundaries, architecture, shared-component policy, and evidence rules. It is **not** a replacement for the current ft_transcendence subject, the frozen validation scope, Trello acceptance criteria, or the current repository state.

---

# 0. Core Rule: Inspect Evidence Before Giving Advice or Editing

Do **not** answer from memory alone when current project evidence is available.

Before proposing implementation, reviewing a feature, or changing shared architecture, inspect the relevant live sources.

## Source priority

Use this order when sources disagree:

1. **Current ft_transcendence subject**
2. **Frozen validation scope**
3. **Frozen UX/navigation specification**
4. **Current GitHub repository and active branch**
5. **Current Trello acceptance criteria / ownership**
6. **Current Figma design for visual/UI decisions**
7. Existing repository documentation
8. Earlier chat/agent context
9. General assumptions

The current repository is the source of truth for what is actually implemented.

Trello is the source of truth for intended task ownership and acceptance criteria.

Figma is a visual/design reference. It must not silently expand the frozen product scope.

## Required evidence check

Before significant advice or edits, an AI agent should determine:

```text
current branch
current main
git status / uncommitted work
branch diff against main
relevant files
relevant Trello card
relevant frozen-scope rule
relevant Figma frame/component if the task is visual
```

If access to one source is unavailable, state that limitation.

Do not invent the current branch state, teammate progress, routes, schema fields, component inventory, or acceptance criteria.

---

# 1. Product Goal

The validation product is a social fitness platform.

The core user loop is:

```text
Discover Gym
    ↓
Plan Workout
    ↓
Train / Log Sets
    ↓
Track Progress
    ↓
Earn Achievements
    ↓
Friends / Chat
    ↓
Repeat
```

The application should feel like one coherent product, not five unrelated student projects.

Primary authenticated product areas:

```text
Home
Gyms
Workouts
Progress
Social
Profile
```

Mobile primary navigation:

```text
Home
Workouts
Gyms
Social
More
```

`More` exposes secondary destinations such as:

```text
Progress
Profile
Settings
Privacy
Terms
```

Exact URL strings can evolve, but route hierarchy and cross-slice consistency must remain coherent.

---

# 2. Frozen Validation Strategy

The team is optimizing for:

```text
Mandatory subject requirements
        ↓
Coherent five-slice product
        ↓
Reliable 14-point validation
        ↓
Integration / regression testing
        ↓
README + evaluation readiness
        ↓
Optional bonus only after the gate
```

Do not expand scope because a feature is interesting.

## Core module direction

The frozen validation plan includes:

- Frameworks
- Prisma ORM
- Standard user management
- User interaction
- Real-time features
- Advanced search
- Custom design system
- Gamification
- OAuth
- Additional browsers

The custom design system requires at least **10 reusable frontend components** plus coherent visual conventions.

## Explicitly deferred unless core is complete

Examples:

- AI recommendations
- RAG assistant
- coach marketplace
- social feed/posts/likes/comments
- advanced workout recommendation logic
- microservices migration
- complex analytics
- broad admin/RBAC systems
- unnecessary infrastructure expansion

Do not promote a deferred feature into current work unless the team explicitly revises the frozen scope.

---

# 3. Five-Slice Ownership

Ownership matters.

A Technical Lead coordinates contracts and integration; the Technical Lead does **not** automatically implement every slice.

## S1 — Platform & Identity

Owns primarily:

- registration
- login/logout
- session/authentication
- OAuth
- first-login onboarding
- own profile/avatar
- shared app-shell/routing foundation
- shared validation/error conventions
- Privacy / Terms
- shared platform integration

S1 provides all slices with:

```text
authenticated user identity
auth middleware / session behavior
profile contract
shared validation/error conventions
app-shell integration
```

## S2 — Gyms & Search

Owns primarily:

- gym discovery
- gym details
- canonical gym equipment
- current-gym behavior
- gym search/filter/sort/pagination

Important contract to S3:

```text
Gym
Equipment[]
```

Do not create a second incompatible equipment vocabulary inside workouts.

## S3 — Workout Planning & Execution

Owns primarily:

- canonical exercise catalog
- exercise search/filtering
- workout plans
- workout days/routines
- ordered exercises
- planned sets
- empty/planned workout sessions
- session snapshots
- performed sets
- rest timers
- workout completion/history
- basic PR logic
- workout route contents and user flows

Core data distinction:

```text
PLAN
what the user intends to do

SESSION
what the user actually did
```

Never destroy historical workout truth merely because a plan changes later.

S3 provides S5 with:

```text
completed sessions
performed sets
volume
PR events/data
```

## S4 — Social & Real-Time

Owns primarily:

- friendships
- online presence
- conversations
- messages
- real-time delivery
- WebSocket behavior

Core validation does not require a social-media feed.

## S5 — Progress & Gamification

Owns primarily:

- progress summaries
- workout statistics
- XP
- levels
- achievements
- leaderboard
- progress views

Consumes completed workout data from S3 rather than independently recreating workout history logic.

---

# 4. Technical Lead Responsibility

The Technical Lead should:

- keep the architecture coherent;
- identify cross-slice contracts;
- detect duplicated concepts;
- detect schema conflicts;
- coordinate route ownership;
- review shared infrastructure;
- ensure critical changes receive peer review;
- maintain evaluation readiness;
- escalate blockers early.

The Technical Lead should **not**:

- implement every teammate's feature;
- silently take ownership of inactive slices;
- rewrite teammate work because it looks imperfect;
- turn shared infrastructure into a personal slice;
- make architectural changes without ownership discussion.

For a cross-slice blocker, communicate:

```text
responsible slice
exact contract/problem
decision required
deadline/integration impact
```

---

# 5. Application Architecture

The project is one full-stack application.

```text
Browser
  │
  ▼
React + Vite + TypeScript
  │
  │ HTTP / WebSocket
  ▼
Express + TypeScript
  │
  │ Prisma ORM
  ▼
PostgreSQL
```

The frontend never talks directly to PostgreSQL.

The backend is the data/security boundary.

The project is **not** currently a microservices architecture.

Prefer the current modular monolith unless the subject or frozen scope explicitly changes.

---

# 6. Request/Data Flow — Mental Model Every Member Must Know

A normal feature request should be traceable end to end.

```text
User interaction
    ↓
React component
    ↓
feature API helper
    ↓
HTTP request
    ↓
Express app / route
    ↓
authentication middleware if protected
    ↓
controller
    ↓
service / business logic
    ↓
Prisma
    ↓
PostgreSQL
    ↓
Prisma result
    ↓
service maps/returns data
    ↓
controller sends HTTP response
    ↓
frontend API helper
    ↓
React state
    ↓
rendered UI
```

For evaluation, every feature owner should be able to explain:

1. where the user action starts;
2. which request is sent;
3. which route handles it;
4. where input is validated;
5. where ownership/authorization is checked;
6. which service performs business logic;
7. which Prisma query changes/reads data;
8. how the response returns to the UI;
9. one failure case;
10. one small modification they could make live.

---

# 7. Repository Structure

Current top-level structure:

```text
ft_transcendence/
├── AGENTS.md
├── Makefile
├── README.md
├── docker-compose.yml
├── docs/
│   ├── architecture.md
│   ├── api.md
│   ├── database.md
│   └── development.md
├── frontend/
└── backend/
```

Do not invent a parallel architecture when an existing one already exists.

---

# 8. Frontend Structure and File Placement

Current frontend foundation:

```text
frontend/src/
├── App.tsx
├── main.tsx
├── assets/
├── features/
├── layouts/
└── pages/
```

Shared UI may exist under:

```text
frontend/src/components/ui/
```

and shared global styling/tokens under:

```text
frontend/src/styles/
```

## What goes where?

### `pages/`

Use for route-level composition.

A page should usually be thin.

Example:

```text
pages/Exercises.tsx
    ↓
features/exercises/ExerciseCatalog.tsx
```

The page owns the route-facing composition, not the detailed domain logic.

### `features/<feature>/`

Use for feature/domain-specific frontend code.

Examples:

```text
features/auth/
features/exercises/
features/workouts/
features/gyms/
features/social/
features/progress/
```

A feature folder may contain:

```text
FeaturePageContent.tsx
FeatureCard.tsx
feature.api.ts
feature.types.ts
feature.utils.ts
feature hooks when justified
```

Do not move a component into shared UI merely because it is visually reusable-looking.

If it knows what an `Exercise`, `WorkoutPlan`, `Gym`, `Conversation`, or `Achievement` is, it is usually a feature component.

### `components/ui/`

Use only for reusable, domain-agnostic UI primitives.

Examples:

```text
Button
Card
Input
Select
Badge
Avatar
Modal
Tabs
Spinner
Alert
EmptyState
Pagination
```

A shared UI component should not import:

```text
Exercise
WorkoutPlan
Gym
Message
Achievement
```

unless it is no longer truly a primitive.

### `layouts/`

Use for shared structural application shells:

```text
MainLayout
public/auth layouts if needed
```

Layout changes can affect every slice.

Treat them as shared architecture and request review from the responsible shared/S1 owner.

### `App.tsx`

Central route registration is shared infrastructure.

Before adding or changing top-level routes:

1. inspect current routing;
2. check frozen UX hierarchy;
3. check route ownership;
4. coordinate if the route change affects another slice;
5. avoid introducing dead links.

A slice owns the contents of its route hierarchy, but central routing remains shared integration work.

---

# 9. Backend Structure and File Placement

Current backend foundation:

```text
backend/src/
├── app.ts
├── server.ts
├── middleware/
└── modules/
```

Existing modules follow feature organization such as:

```text
modules/auth/
modules/users/
modules/exercises/
modules/workouts/
```

The exercise module demonstrates the current separation:

```text
exercise.route.ts
exercise.controller.ts
exercise.service.ts
```

## Responsibilities

### Route

Responsible for:

- HTTP method/path
- middleware chain
- controller registration

Do not put substantial business logic in the route file.

### Controller

Responsible for:

- reading HTTP input;
- parsing/validating request-level values;
- calling service functions;
- translating service results/errors into HTTP responses.

Do not turn controllers into large database/business-logic files.

### Service

Responsible for:

- business rules;
- ownership decisions when appropriate;
- transactions;
- Prisma queries;
- domain transformations;
- reusable application logic.

The service should not depend on React or browser behavior.

### Middleware

Use for cross-cutting HTTP behavior such as:

- authentication;
- request identity;
- shared validation/error concerns when appropriate.

Do not create a new authentication system inside each module.

---

# 10. Database / Prisma Rules

Database source:

```text
backend/prisma/schema.prisma
```

Migrations:

```text
backend/prisma/migrations/
```

All slices share one PostgreSQL database and one Prisma schema.

Before changing the schema, inspect existing models and relationships.

## Mandatory schema questions

Before adding/changing a model or field, answer:

1. Does an equivalent model/field already exist?
2. Which slice owns this concept?
3. Who owns the record?
4. What is the foreign key?
5. Is it optional or required?
6. What is its lifecycle?
7. What happens on deletion?
8. Does historical data depend on it?
9. Does it need a uniqueness constraint?
10. Does it need an index?
11. Is another slice already depending on this contract?

Do not:

- create a second `User`;
- create duplicate Equipment concepts;
- duplicate session/auth models;
- edit old migrations casually;
- reset/delete data without explicit approval;
- introduce schema changes only for a speculative UI.

After schema changes, verify at minimum:

```bash
npx prisma format
npx prisma validate
```

and use the repository's migration workflow.

---

# 11. Historical Data Rule

The project must preserve historical correctness.

Example:

```text
WorkoutPlan
    ↓ user edits it next week

Completed WorkoutSession
    ↓ must still describe what actually happened last week
```

Therefore:

- plans are reusable intentions;
- sessions are historical events;
- planned set targets are not the same as performed set values;
- current configuration must not rewrite completed history.

Do not trade away historical correctness for speed without an explicit team decision.

---

# 12. Authentication / Ownership Rule

Frontend visibility is not authorization.

If a resource belongs to a user, the backend must verify ownership.

Preferred identity source:

```text
authenticated request context / req.userId
```

Do not accept a client-provided `userId` as proof of ownership.

Typical protected flow:

```text
request
   ↓
authenticate middleware
   ↓
req.userId
   ↓
controller/service
   ↓
ownership check
   ↓
database operation
```

All slices reuse S1 identity/auth infrastructure.

---

# 13. Shared Design System

The frozen validation path requires a custom design system with at least **10 reusable components**.

The goal is not merely to create ten files.

The goal is:

```text
coherent shared visual language
+
reusable components
+
real reuse across slices
+
documented behavior
+
responsive/accessibility states
```

Expected shared conventions include:

- color palette;
- typography;
- spacing;
- radius;
- icons;
- hover states;
- focus states;
- disabled states;
- error states where relevant.

---

# 14. Shared Component Decision Workflow

Before creating a component, follow this exact process.

## Step 1 — Search first

Check:

```text
frontend/src/components/ui/
existing feature components
current shared-ui/design-system branch
open PRs
Figma components
Trello shared-design cards
```

Do not create `Button2`, `CustomButton`, `GreenButton`, `MyModal`, etc. because you did not search.

## Step 2 — Ask whether it is domain-agnostic

If the component understands domain data, keep it in the feature.

Examples:

```text
ExerciseCard       → feature/exercises
WorkoutPlanCard    → feature/workouts
GymCard            → feature/gyms
MessageBubble      → feature/social
AchievementCard    → feature/progress
```

Generic primitives can be shared:

```text
Button
Card
Input
Select
Modal
Alert
Spinner
EmptyState
```

## Step 3 — Ask whether reuse is real

A component is a good shared candidate if:

- two or more slices need the same UI behavior; or
- it is clearly a foundation primitive used throughout the app; or
- centralizing it prevents visual/accessibility inconsistency.

Do not extract speculative abstractions only because they might be reused one day.

## Step 4 — Check ownership

If the change touches:

```text
shared UI primitive
global tokens
app shell
central routing
auth conventions
API error format
Prisma shared entities
Docker/infrastructure
```

it is shared architecture.

Discuss with the responsible owner/Technical Lead before a broad change.

## Step 5 — Choose `className` vs variant

Use caller-level styling for a one-off contextual difference.

Example:

```tsx
<Card className="h-full" />
```

Use a named variant when the same semantic role repeats.

Example:

```tsx
<Button variant="primary" />
<Button variant="secondary" />
<Button variant="ghost" />
```

Rule:

```text
one-off presentation difference
→ className

repeated semantic role
→ variant
```

Do not add variants merely because different colors are possible.

## Step 6 — Preserve native behavior

Shared primitives should usually extend native element attributes rather than reimplementing every prop manually.

Examples:

```text
Button → button attributes
Input  → input attributes
Card   → div attributes when appropriate
```

This preserves:

- accessibility attributes;
- event handlers;
- `disabled`;
- `type`;
- `name`;
- `aria-*`;
- normal browser semantics.

## Step 7 — Implement important states

Relevant components must intentionally consider:

```text
default
hover
focus-visible
active
disabled
error
loading
```

Not every component needs every state.

Do not implement meaningless variants/states just to satisfy a checklist.

## Step 8 — Use design tokens

Do not spread raw visual values across feature files when a shared semantic token exists.

Prefer:

```text
app-primary
app-surface
app-canvas
app-text
app-border
```

over repeated hard-coded colors.

If a new global token is needed, confirm that the concept is genuinely global.

## Step 9 — Prove reuse

A new shared component should preferably be adopted by at least one real feature in the same PR or soon after.

A folder full of unused components is not a useful design system.

## Step 10 — Document it

When a reusable component becomes part of the design system, record:

- purpose;
- props;
- variants;
- important states;
- example usage;
- accessibility constraints if relevant.

---

# 15. Before Creating a Shared Component — Checklist

```text
[ ] I searched existing shared components.
[ ] I searched active branches / PRs for parallel work.
[ ] I checked Figma if this is a visual component.
[ ] I checked the relevant Trello/shared-design card.
[ ] This component is domain-agnostic.
[ ] Reuse is real, not speculative.
[ ] I know whether a className difference or variant is appropriate.
[ ] I will use existing design tokens.
[ ] I considered focus/hover/disabled/error behavior where relevant.
[ ] I know which real feature will consume it.
[ ] I am not duplicating a teammate's work.
```

If several answers are `no`, do not immediately put it in `components/ui`.

---

# 16. Before Using UI in a Feature — Checklist

Feature owners should ask:

```text
Do we already have a shared Button?
Do we already have a shared Input?
Do we already have a shared Card?
Do we already have a shared Select?
Do we already have Alert/Spinner/EmptyState?
Does Figma show an established component?
Does another slice already solve this?
```

Reuse before creating local duplicates.

Feature-specific composition is still allowed.

Example:

```text
shared Card
    ↓
ExerciseCard
    ↓
Exercise Catalog
```

The shared primitive owns generic appearance.

The feature component owns domain meaning.

---

# 17. API-Backed Frontend State Rule

Every data-backed screen must intentionally handle:

```text
Loading
Error
Empty
Loaded
```

If data can be incrementally loaded, also consider:

```text
initial loading
later-page loading
initial failure
later-page failure
retry
final page
duplicate prevention
```

Do not treat network success as guaranteed.

Shared components such as `Spinner`, `Alert`, and `EmptyState` should be extracted when enough real screens need the same presentation.

---

# 18. Responsive Design Rule

Responsive design is not simply shrinking desktop dimensions.

Approximate targets:

```text
Desktop     ~1200px+
Tablet      ~768–1199px
Mobile      <768px
```

Expected behavior:

```text
Desktop
→ persistent/large navigation
→ multi-column content

Tablet
→ reduced columns / compact navigation

Mobile
→ single-column primary content
→ touch-friendly actions
→ top bar / bottom navigation where appropriate
→ secondary flows may become full screen
```

Test realistic widths such as:

```text
320
375
430
768
desktop
wide desktop
```

Do not optimize product UX around absurd widths such as 100px.

Do not hide layout defects with `overflow-x: hidden` unless clipping is actually the intended design.

---

# 19. Route and Navigation Workflow

Do not create pages in isolation from the user's mental model.

Before adding a route, answer:

1. Which product area owns it?
2. How does the user reach it?
3. Where does the user return afterward?
4. Does it preserve context?
5. Is it in the frozen route hierarchy?
6. Does the route already exist under a temporary name?
7. Will another slice link to it?
8. Who owns central route registration?

Correct context-preserving flow:

```text
Workout Day Builder
    ↓
Add Exercise
    ↓
Exercise Catalog / Picker
    ↓
Select
    ↓
Return to Workout Day Builder
```

Wrong behavior:

```text
Select Exercise
    ↓
send user to Home
```

Home should summarize cross-slice information; it should not duplicate every feature.

---

# 20. Feature Development Workflow

For every Trello feature card:

## Phase A — Inspect

Before coding:

```text
1. Read Trello card and acceptance criteria.
2. Check frozen scope.
3. Inspect current main.
4. Inspect relevant active teammate branches/PRs.
5. Inspect existing frontend feature code.
6. Inspect backend module code.
7. Inspect Prisma schema.
8. Inspect API docs.
9. Inspect Figma when UI/design is involved.
10. Identify cross-slice dependencies.
```

Do not begin by generating a large implementation.

## Phase B — Define the vertical slice

Write the smallest working user flow.

Example:

```text
React form
    ↓
POST /api/workout-plans
    ↓
auth req.userId
    ↓
controller
    ↓
service
    ↓
Prisma create
    ↓
response
    ↓
render created plan
```

The first implementation should prove the complete path, not perfect every visual detail.

## Phase C — Create a focused branch

Do not work directly on `main`.

Preferred patterns:

```text
feature/<feature>
fix/<bug>
chore/<task>
docs/<topic>
```

Keep one coherent concern per branch.

## Phase D — Implement incrementally

Prefer small reviewable changes:

```text
contract
→ backend
→ API test
→ frontend
→ failure states
→ responsive behavior
→ documentation
```

Exact order can vary, but avoid massive unreviewable changes.

## Phase E — Verify

Run the narrowest relevant verification first.

Examples:

```bash
npm run build
npx prisma format
npx prisma validate
git diff
git status
```

Also test the actual runtime flow.

For API-backed functionality test:

```text
success
invalid input
unauthenticated request
unauthorized ownership
empty result
network/server failure where relevant
repeated user actions
```

## Phase F — Review

Review findings should be classified:

### BLOCKING

Examples:

- broken requirement
- data corruption
- authorization bypass
- historical data loss
- race condition affecting correctness
- broken build
- invalid schema
- dead critical route

### IMPORTANT

Examples:

- fragile error handling
- duplicated shared logic
- weak typing
- maintainability issue
- missing important state
- unclear API contract

### OPTIONAL

Examples:

- minor naming
- cosmetic cleanup
- non-essential refactor

Do not mix personal style preferences with verified defects.

## Phase G — Pull Request

Before PR:

```text
[ ] build passes
[ ] relevant runtime flow tested
[ ] database changes validated/migrated if applicable
[ ] no secrets committed
[ ] scope is focused
[ ] docs updated if contract changed
[ ] branch is reasonably current with main
[ ] shared changes have an appropriate reviewer
```

PR should explain:

```text
why
what changed
how to test
scope intentionally excluded
cross-slice impact
known limitations
```

---

# 21. Git / Branch Evidence Rules for AI Agents

When the user asks:

```text
"what should I do next?"
"review my branch"
"what is my teammate doing?"
"is this already implemented?"
"can I change this shared file?"
```

the agent should inspect GitHub first when access is available.

At minimum:

```text
compare active branch vs main
inspect changed files
inspect recent commits
inspect open/relevant PRs
inspect teammate branch if named
```

Do not claim a local change is pushed.

Do not claim teammate work exists merely because it was discussed.

Do not assume a branch checkpoint remains current after new commits.

If the user has local uncommitted work that GitHub cannot see, say so.

---

# 22. Trello Rules for AI Agents

Before assigning work:

1. find the relevant card;
2. read acceptance criteria;
3. inspect its current list/status;
4. identify slice ownership;
5. check dependencies;
6. distinguish core vs deferred work.

Do not create an implementation plan that silently conflicts with the Trello/frozen scope.

If Trello conflicts with the frozen scope, flag it rather than silently choosing one.

---

# 23. Figma Rules for AI Agents and Team Members

Use Figma for:

- visual hierarchy;
- spacing;
- component intent;
- responsive design direction;
- icon placement;
- user-flow reference.

Before changing UI based on Figma:

```text
check the relevant current frame/component
compare with frozen UX
compare with current shared components/tokens
compare with implementation feasibility
```

Do not:

- treat every exploratory Figma screen as required scope;
- create a second component system because Figma looks different;
- copy visual values without checking existing tokens;
- let Figma override security/data contracts.

If Figma and frozen UX differ materially, raise the conflict.

---

# 24. Cross-Slice Contract Workflow

If your feature needs another slice's data:

Do not copy its model or create a parallel concept.

Write the contract explicitly.

Example:

```text
S2 owns:
Equipment

S3 needs:
exercise equipment requirement
current gym equipment compatibility
```

Decision:

```text
reuse canonical Equipment identifiers/relations
```

For every cross-slice dependency define:

```text
owner
consumer
field/data shape
API or database boundary
ownership semantics
failure behavior
deadline
```

Ask early enough to leave integration time.

---

# 25. Shared Architecture Change Rule

Changes to these require explicit cross-slice awareness:

```text
App.tsx routing foundation
MainLayout/app shell
authentication/session behavior
global Axios/API client
global error format
shared UI components
global design tokens
schema models used by several slices
Docker Compose
environment variables
central middleware
WebSocket infrastructure
```

A feature owner can propose/implement a shared change, but should not silently redefine another slice's contract.

Critical shared changes should receive peer review.

---

# 26. Design-System Team Workflow

The design system should grow through real feature needs.

Recommended pattern:

```text
Feature A needs Button
→ create/review shared Button
→ Feature A uses it

Feature B needs same Button
→ reuse

Feature C needs an Input
→ check Figma + existing patterns
→ create shared Input
→ document states
→ real feature adopts it
```

Avoid:

```text
"we need 10 components"
→ generate 10 unused components
→ nobody uses them
→ each slice still creates local duplicates
```

The validation goal is coherent reuse, not file count alone.

Suggested eventual inventory:

```text
Button
Input
Select
Card
Badge
Avatar
Modal
Tabs
Spinner
Alert
EmptyState
Pagination
```

This list is a target pool, not an instruction to build all of them immediately.

---

# 27. Shared Component Change Protocol

If you need to change an existing shared component:

1. search all usages;
2. identify whether the change is backward compatible;
3. test at least the affected consumers;
4. avoid changing semantics for one feature only;
5. prefer an optional prop/variant only when semantically justified;
6. request review if multiple slices are affected.

Example:

Bad:

```text
Change Card base style only because GymCard needs a special layout.
```

Better:

```text
Keep Card generic.
GymCard supplies feature-specific composition/className.
```

If the same special role later appears repeatedly, consider a variant.

---

# 28. Error / Loading / Empty Shared Patterns

Do not immediately create separate local error widgets in every slice.

When repeated patterns appear, converge on shared primitives such as:

```text
Alert
Spinner
EmptyState
Retry action using shared Button
```

But behavior remains feature-owned.

Example:

```text
Shared Alert
→ owns alert presentation

ExerciseCatalog
→ owns whether a failed page keeps existing cards

WorkoutPlans
→ owns whether a failed create operation preserves form data
```

Shared UI should not absorb domain-specific recovery rules.

---

# 29. Security Checklist for Every Slice

Before merging a protected feature:

```text
[ ] backend validates input
[ ] authentication required where appropriate
[ ] authorization/ownership checked
[ ] client userId is not trusted as ownership proof
[ ] secrets are not committed
[ ] internal errors are not leaked
[ ] concurrent/repeated requests considered
[ ] destructive operations are deliberate
```

If the feature changes authentication or shared security behavior, S1/shared review is required.

---

# 30. Evaluation Readiness

Every team member should be able to explain their own vertical slice.

After each meaningful implementation, practice:

```text
trace request/data flow
explain one failure case
justify one technical decision
make one small modification
```

Do not rely on AI-generated code the team cannot explain.

The evaluator may ask:

- Why this model relation?
- Why this state exists?
- What happens if this request fails?
- Where is authorization checked?
- Why is this shared?
- What happens if the user double-clicks?
- What happens to historical data after editing a plan?
- Can you change this behavior now?

Implementation quality includes explainability.

---

# 31. Deadline Priority

Project target: finish before **16–20 November 2026**.

Classify work as:

## Must finish before deadline

- mandatory subject requirements;
- frozen core product;
- 14-point module requirements;
- cross-slice integration;
- core security/ownership;
- correct database history;
- responsive core UI;
- build/runtime reliability;
- regression testing;
- README/evaluation preparation.

## Should finish if it supports validation/integration

- design-system completion;
- accessibility cleanup;
- improved shared error/loading states;
- useful UX polish;
- peer-review improvements.

## Defer unless core product is complete

- bonus features;
- speculative abstractions;
- complex animations;
- AI/coach systems;
- advanced workout recommendation systems;
- large architectural refactors;
- non-essential visual polish.

Reserve time for:

```text
integration
regression testing
documentation
peer review
evaluation practice
bug fixing
```

Do not schedule all remaining time as feature-development time.

---

# 32. Dated Repository Checkpoint — Must Be Refreshed

As of **15 September 2026**, the repository uses:

```text
Frontend: React + Vite + TypeScript
Backend: Express + TypeScript
ORM: Prisma
Database: PostgreSQL
Infrastructure: Docker Compose
```

Current repository documentation includes:

```text
AGENTS.md
docs/architecture.md
docs/api.md
docs/database.md
docs/development.md
```

The backend currently follows feature modules under:

```text
backend/src/modules/
```

The frontend currently follows route/page/feature separation under:

```text
frontend/src/
```

A shared-UI branch has been establishing:

```text
design tokens
Button
Card
exercise-catalog adoption
responsive UI
shared app-shell visual styling
```

**Do not treat this dated checkpoint as permanent.**

Before using it for a decision, inspect current GitHub evidence.

---

# 33. AI-Agent Required Response Behavior

When this file is supplied as project/agent context, the agent should follow these rules.

## Before assigning work

Determine from evidence:

```text
what is already implemented
what is pushed vs only local
what currently fails
what the owner can explain
which acceptance criterion is next
which slice owns it
whether another branch/PR already touches it
```

## When the user asks to learn

Prefer:

```text
small attempt
→ concrete problem
→ necessary concept
→ how it helps
→ small verification
```

Do not dump a complete implementation immediately unless requested.

## When the user explicitly asks to implement

Provide the smallest coherent change.

Explain:

```text
files changed
request/data flow
new concept
failure behavior
verification
```

Do not intentionally provide broken intermediate code as the final solution.

## When reviewing

Use:

```text
BLOCKING
IMPORTANT
OPTIONAL
```

Separate:

```text
verified defect
risk
preference
```

State what was actually tested and what remains unverified.

## When evidence contradicts previous advice

Correct the advice openly.

Do not defend an old recommendation simply because it was previously given.

---

# 34. "What File Should I Create?" Decision Tree

Use this quick guide.

```text
Is it route-level composition?
    YES → frontend/src/pages/

Is it UI/business behavior for one domain?
    YES → frontend/src/features/<domain>/

Is it a generic reusable UI primitive?
    YES → frontend/src/components/ui/

Is it global visual token/theme?
    YES → frontend/src/styles/

Is it shared page shell/navigation layout?
    YES → frontend/src/layouts/
          + coordinate shared/S1 ownership

Is it an HTTP endpoint for one backend domain?
    YES → backend/src/modules/<domain>/

Is it cross-cutting HTTP behavior?
    YES → backend/src/middleware/
          + shared review

Is it persistent relational data?
    YES → backend/prisma/schema.prisma
          + inspect existing shared models first

Is it architectural/API/database documentation?
    YES → docs/
```

Do not create new top-level folders casually.

Follow the current repository before inventing structure.

---

# 35. "Should This Be Shared?" Decision Tree

```text
Does it know a domain model?
    YES
    → feature component

NO
    ↓

Does more than one feature need the same behavior,
or is it a foundational primitive?
    NO
    → keep local for now

YES
    ↓

Does an equivalent shared component already exist?
    YES
    → reuse/extend carefully

NO
    ↓

Check Figma + active branches + Trello
    ↓

Implement the smallest generic API
    ↓

Adopt it in a real feature
    ↓

Document it
    ↓

Peer review if cross-slice impact
```

---

# 36. Team Status Sync Template

At least during active integration periods, each member should be able to report:

```text
Slice:
Current Trello card:
Current branch:
Latest pushed commit:
Working behavior:
Known failure/blocker:
Cross-slice dependency:
Next acceptance criterion:
Expected review needed from:
```

Do not manage progress only through verbal statements.

Push WIP branches when useful so integration risk is visible.

---

# 37. Pull Request Review Questions

Reviewer should ask:

```text
Does this satisfy the Trello acceptance criteria?
Is it still inside frozen scope?
Does it duplicate a shared concept?
Does it break another slice contract?
Does it preserve auth/ownership?
Does it preserve historical data?
Does it introduce dead routes?
Does it handle loading/error/empty states?
Does it use the design system where appropriate?
Does it add unnecessary abstraction?
Can the author explain the full flow?
Was the relevant runtime behavior actually tested?
```

---

# 38. Definition of Done for a Vertical Feature

A feature is not done just because a React screen exists.

A vertical feature is done when applicable parts are complete:

```text
User action/UI
    ↓
typed frontend request
    ↓
backend route
    ↓
validation
    ↓
authentication/authorization
    ↓
service/business rule
    ↓
Prisma/database
    ↓
response
    ↓
UI state
    ↓
failure handling
    ↓
verification
```

and the acceptance criteria are satisfied.

---

# 39. Final Team Mental Model

```text
                      S1
             PLATFORM & IDENTITY
                      │
           shared identity / shell
                      │
       ┌──────────────┼──────────────┐
       ▼              ▼              ▼
      S2             S3             S4
     GYMS          WORKOUTS         SOCIAL
       │              │              │
       └──────┐       │       ┌──────┘
              ▼       ▼       ▼
                     S5
           PROGRESS & GAMIFICATION
                      │
                      ▼
                     HOME
```

Shared foundations support the slices.

They do not replace slice ownership.

Each slice should still deliver at least one complete vertical flow from React to PostgreSQL and back.

---

# 40. Short Rule Set

When uncertain, follow these rules:

```text
Inspect before editing.
Check GitHub before assuming.
Check Trello before assigning.
Check Figma before inventing UI.
Frozen scope beats feature enthusiasm.
Reuse before duplicating.
Feature-specific stays in the feature.
Domain-agnostic reusable UI may become shared.
Shared architecture requires coordination.
Frontend never owns authorization.
Backend never trusts browser ownership claims.
Plans are not sessions.
Planned values are not performed values.
Completed history must remain historically correct.
Build vertically.
Keep branches focused.
Test failure paths.
Peer-review critical shared changes.
Do not let AI write code the team cannot explain.
Finish the core before bonuses.
```

---

# Recommended Sources to Attach Alongside This File

For best results, give the AI/project context access to:

```text
Current ft_transcendence subject
FT_TRANSCENDENCE_VALIDATION_SCOPE.md
FT_TRANSCENDENCE_UX_NAVIGATION_VALIDATION_SCOPE.md
repository AGENTS.md
docs/architecture.md
docs/api.md
docs/database.md
docs/development.md
current Prisma schema
current Trello board/cards
current Figma file
GitHub repository + active branches/PRs
```

This context file explains **how to work**.

Those sources explain **what is currently true**.

Always refresh live evidence before making a significant project decision.
