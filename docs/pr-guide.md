# ft_transcendence — Team PR Guide

A practical reference for a five-person student development team

## Main rule

> **Each PR delivers one clear, useful, testable task.**

A PR does not need to finish an entire page or feature. It must finish what its title and description promise.

It is fine to build in layers locally: functionality, edge cases, then styling. Those layers do not automatically need separate PRs. Prefer finishing one useful task before starting several unfinished pages, unless the team explicitly agreed to a cross-page prototype.

Push unfinished work regularly for backup and visibility. Use a draft PR while work is incomplete. Request review when the agreed task is ready.

## Required PR description

Copy this short template into each PR and fill it in:

```text
Task:                   What does this PR deliver? Link the task/card when available.
Implemented:            What works now?
Known issues:           What is incorrect or limited?
Intentionally deferred: What comes later, and where is it tracked?
Shared impact:          Does this affect components, routes, APIs, authentication, or a database others use?
Verification:           What did you actually test, and how can the reviewer check it?
```

> **Be precise:** “Backend integration is planned next” describes deferred functionality. “The selected filter does not match the results” describes a bug. Both belong in the PR description and must be described honestly.

Put scope clarifications and accepted follow-ups in the PR, even if they were first discussed in Discord.

> **A draft PR is useful early. A review request means the promised task is ready for review.**

## Choose the right PR shape

One useful task at a time; keep the scope visible

| Change | Practical guidance |
|---|---|
| Page or feature | Deliver a coherent task. A filter UI using fake data is valid when that scope is explicit. Do not call the full feature complete before real integration. |
| Small, nonurgent fix | Usually bundle it with the next related task. Track it in an existing PR comment or an issue, based on importance. Avoid a separate PR for every minor adjustment. |
| Urgent fix or team blocker | A small standalone PR is appropriate for a critical regression or to unblock others. PR value is not measured by line count. |
| Bug | PR-caused build failures, server crashes, security/ownership problems, data loss, or broken existing core/shared flows block merging. Minor bugs may be deferred when acknowledged, nonblocking, and tracked. A known bug is not automatically safe just because it is intentional or acknowledged. |
| Refactor | State the concrete benefit, preserve behavior, and test affected flows. Keep unrelated cleanup separate. |
| Shared UI component | Check existing consumers and relevant states, not only the page that motivated the change. Coordinate changes to props or behavior. |
| Database/schema | Coordinate with affected owners. Explain migration and compatibility impact. Preserve existing data; test an upgrade on populated data when relevant. |
| API, routes, auth | Explain changed contracts. Update affected callers and navigation links. Check authorization, ownership, and existing flows where relevant. |

> **MERGE BLOCKERS:** A PR-caused build failure, server crash, security or ownership problem, data loss, or broken existing core/shared flow must be fixed before merge.

**Quick check:** Is the delivered behavior clear, and does the PR description distinguish what works, what is limited, and what comes later?

## Name it clearly. Verify what changed.

Commit titles, PR titles, and branch names serve different purposes

### Naming commits and PRs

Use the pattern `type(scope): short description`.

| Type | Meaning | Example |
|---|---|---|
| `feat` | New functionality | `feat(gyms): add name and verification filters` |
| `fix` | Fixes wrong behavior | `fix(chat): handle database errors on disconnect` |
| `refactor` | Restructures code; keeps behavior | `refactor(friends): extract friendship lookup` |
| `style` | Visual or formatting changes only | `style(profile): adjust avatar spacing` |
| `chore` | Maintenance, tooling, or dependencies | `chore(deps): update dependencies` |
| `docs` | Documentation | `docs(api): document conversation endpoints` |
| `test` | Tests | `test(workouts): cover repeated completion` |

**Team convention:** Here, `style` means visual or formatting-only changes. Commit titles describe individual changes; the PR title describes the overall deliverable. Avoid vague titles like “updates,” “final fixes,” or “following a comment.”

**Branch examples:** `feature/gym-filters` `fix/chat-errors` `refactor/friends-service`

### Ready-to-merge checklist

- The promised task is delivered; the description explains scope and limitations.
- Relevant build and behavior checks pass. User-facing changes are checked in the browser.
- Persistence changes have relevant database checks; shared changes are coordinated and affected consumers checked.
- No unresolved critical blocker or merge conflict remains. Deferred work is recorded.
- Required review and repository checks are satisfied.

> **Match verification to the change:** fake-data UI does not need database tests. Small styling improvements do not need to be perfect before merging. Fixes normally update the same open PR; a review finding does not mean the PR must be closed.

### Task completion is a separate decision

Merge readiness and completion of the agreed task are separate decisions. A small fix can be valid to merge without completing a larger task. Commit count, lines changed, and number of merged PRs do not prove completion. Review whether the delivered behavior satisfies the task agreed for the existing timeframe; this guide does not set or manage deadlines.

| Agreed task | What the same fake-data PR means |
|---|---|
| “Gym filtering UI using fake data.” | Working combined filters can complete the task. |
| “Gym search connected to the real API.” | Fake-data filtering is partial progress. |

> **Clear scope. Working result. Honest verification. Visible follow-up.**
