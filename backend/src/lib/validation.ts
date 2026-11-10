import { WorkoutSetType } from "@prisma/client";
import { z } from "zod";

// Rules used by more than one S3 module (workouts, workout-sessions, exercises).
// A rule only one module uses stays in that module's *.schema.ts.
// The frontend checks the same limits and messages in
// frontend/src/features/workouts/shared/limits.ts and set-values.ts.

// Every id in the database is a UUID; anything else in the URL can't match a row.
export const idParam = z.uuid();

export const exerciseIdValue = z.uuid("Exercise not found.");

// Text a user types is one clean line: no control characters (NUL, line breaks, tabs),
// and a name needs at least one visible character (letter, number, punctuation or symbol, emoji included).
export const CONTROL_CHARACTER = /\p{Cc}/u
export const VISIBLE_CHARACTER = /[\p{L}\p{N}\p{P}\p{S}]/u

// Per plan day and per workout.
export const MAX_EXERCISES = 20;
export const MAX_SETS_PER_EXERCISE = 20;

// The values below are never nullable here: each body adds .nullable() / .optional(),
// and null means "no value", never 0.

const REST_MESSAGE = "Rest must be between 0 and 3600 seconds."

export const restSecondsValue = z.number(REST_MESSAGE).int(REST_MESSAGE).min(0, REST_MESSAGE).max(3600, REST_MESSAGE)

const WEIGHT_MESSAGE = "Weight must be between 0 and 1000 kg."
const REPS_MESSAGE = "Reps must be a whole number between 1 and 999."
const DURATION_MESSAGE = "Time must be a whole number of seconds, 1 to 86400."
const DISTANCE_MESSAGE = "Distance must be between 0 and 1000000 m."

export const setTypeValue = z.enum(WorkoutSetType, "Invalid set type.")

export const weightValue = z.number(WEIGHT_MESSAGE).min(0, WEIGHT_MESSAGE).max(1000, WEIGHT_MESSAGE)
    .refine(value => Number(value.toFixed(2)) === value, WEIGHT_MESSAGE)

export const repsValue = z.number(REPS_MESSAGE).int(REPS_MESSAGE).min(1, REPS_MESSAGE).max(999, REPS_MESSAGE)

export const durationValue = z.number(DURATION_MESSAGE).int(DURATION_MESSAGE)
    .min(1, DURATION_MESSAGE).max(86400, DURATION_MESSAGE)

export const distanceValue = z.number(DISTANCE_MESSAGE).gt(0, DISTANCE_MESSAGE).max(1000000, DISTANCE_MESSAGE)
    .refine(value => Number(value.toFixed(1)) === value, DISTANCE_MESSAGE)
