# Seed data: exercise catalog (`exercises.json`)

318 exercises: 310 translated from [free-exercise-db-with-videos](https://github.com/amiinwani/free-exercise-db-with-videos)
(`data/exercises.json`, read from the fork `harshvishu/free-exercise-db-with-videos`) and 8 written by hand (`sourceId: null`).

Credit: exercise data and images (`frontend/public/exercise-images/`, resized) © 2026 Arham Wani, free-exercise-db-with-videos, MIT License.

## How a source row is translated

Of the 317 source rows, 3 generic rows ("Cardio Exercise"…) are dropped and 4 are merged as the same movement under another name. A variant is always kept.

- **type**: what the user logs. Load and reps → `WEIGHT_REPS`; body weight, bands or a stability ball →
  `BODYWEIGHT_REPS`; body weight plus a held load → `WEIGHTED_BODYWEIGHT`; holds, stretches and timed cardio → `DURATION`; run, bike, elliptical → `DISTANCE_DURATION`.
- **muscles**: the source `target` becomes one name from `MUSCLE_GROUPS`; synonyms are collapsed (lats, traps,
  rhomboids → Upper Back). `secondaryMuscles` uses the same mapping, without the primary.
- **equipment**: names from `EQUIPMENT`, only what the exercise truly requires. An exercise is available at a gym
  only when the gym has ALL its equipment, so every extra item hides it from more gyms.

Known limit: the availability rule has no either/or. Exercises that need a rack (squats) list only "Barbell",
because "Squat Rack or Power Rack" cannot be expressed. Incline and decline exercises require that exact bench.

## How the seed writes it (`exercises.ts`)

1. The whole file is checked with zod before any write; a wrong type, muscle or equipment name stops the seed with the exercise name and the field.
2. Muscle groups and equipment are loaded once as name → id maps (`seed.ts` seeds them first).
3. Each exercise is upserted by `name`, then its muscle and equipment links are deleted and recreated from the file, in one transaction per exercise.
4. Exercises no longer in the file are deleted only when no plan and no workout uses them.

Running it again gives the same rows: nothing is appended, links always match the file, ids do not change.
`difficulty`, `instructions`, `formCues`, `commonMistakes` and `aliases` are checked but not written yet (no column).

## Add or change an exercise

Edit `exercises.json` (sorted by name) and run `npx prisma db seed`. `name` is the key: a new name creates a new
exercise. New muscle groups or equipment go into `muscle-groups.ts` / `equipment.ts` first. An image is
`<slug>.jpg` in `frontend/public/exercise-images/`, or `null`.

After pulling this change, reset your dev database once (`npx prisma migrate reset`): on an existing database,
old exercises that a plan or a workout still uses stay in the catalog, without an image.
