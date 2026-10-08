# ft_transcendence

## Project priorities

Complete the frozen core product before 16–20 November 2026.

Prioritize:
1. frozen-scope functionality
2. correctness and integration
3. validation
4. optional improvements only after the core is reliable

Do not expand scope without a concrete blocker.

## Evidence

Inspect current repository evidence before making implementation claims.

Distinguish:
- required
- planned
- implemented
- verified
- unknown

Do not invent routes, schema fields, DTOs, contracts, or test results.

## Architecture

Frontend: React + TypeScript
Backend: Express + TypeScript
Database: PostgreSQL + Prisma

Preserve authenticated ownership and historical workout/session data.

## Git

Do not push directly to main.

Use focused feature/fix branches and pull requests.

Do not discard unfamiliar or teammate work.

Ask before destructive Git operations.

## Verification

Never claim a feature works without checking it.

Use the repository's existing build, lint, test and runtime commands.

When relevant verify:
- success
- failure
- authentication/ownership
- repeated actions
- browser console
- database correctness