# S3 — Workouts (draft README part)

## Features

- **Plans**: create, rename and delete workout plans (up to 3 per user), each with a name and an optional description.
- **Days**: add, rename and delete days in a plan (up to 7 per plan).
- **Day editor**: pick the exercises of a day, reorder them, set the rest time, and add sets with a set type and targets (weight, reps, time or distance, depending on the exercise type). Up to 20 exercises per day and 20 sets per exercise. Save sends the whole day at once.
- **Exercise picker**: search exercises by name, filter by primary muscle, by equipment and by what the current gym has, sort by name (A–Z or Z–A), and load the list page by page. Each exercise shows whether the current gym can do it.
- **Active workout**: start an empty workout or start from a plan day (the day is copied, so later plan edits do not change it). One workout in progress at a time. Add exercises and sets, enter values, tick sets, reorder exercises, delete sets. A ticked set that beats the earlier best of its exercise is marked as a PR while you train. Discard deletes the workout.
- **Finish**: needs at least one ticked set. Shows a summary (duration, sets, volume, exercises), marks personal records (best estimated one-rep max per exercise), and gives XP through the S5 award function. Finishing twice does not give XP twice.

## Modules S3 backs

- **Advanced Search**: the exercise search. Search by name, filters (muscle, equipment, current gym) that work together, sort by name, and pagination (`GET /api/exercises`, `GET /api/exercises/filters`).
- **ORM**: all S3 data goes through Prisma (plans, days, exercises, sets, workouts), with transactions and row locks where two requests can collide.
- **Gamification (data side)**: S3 stores `isPr` on each set at finish and calls S5's `award()` inside the finish transaction. It also gives S5 `getWorkoutStats` for weekly numbers. See `docs/contracts.md`.

## Contribution

Aymane (shank187): S3 owner and Tech Lead. Schema lane, the contracts between S2, S3 and S5, and reviews.

## Known limitations

- Week boundaries are computed by the caller: `getWorkoutStats` takes a `from` and a `to` and does not know about weeks or time zones.
- Units are shown as stored: weight in kg. There is no unit setting.
