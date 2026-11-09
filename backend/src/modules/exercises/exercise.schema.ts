import { z } from "zod";

// The frontend search box has the same maxLength (frontend/src/features/workouts/shared/limits.ts).
const SEARCH_MAX_LENGTH = 100
// NUL, line breaks, tabs: the database rejects NUL, and none belong in a search.
const CONTROL_CHARACTER = /\p{Cc}/u
// Plain digits only: Number() would also accept "1e2", "0x10", "1.5" or "+1".
const DIGITS = /^\d+$/

// Every value arrives as text. Express turns a repeated key (?muscle=a&muscle=b)
// into an array, so z.string() rejects it with that field's message.
// "" for search, muscle or equipment means no filter.
export const exerciseListQuery = z.object({
    page: z.string("Invalid Page").regex(DIGITS, "Invalid Pagination").default("1")
        .transform(Number).refine(page => Number.isSafeInteger(page) && page >= 1, "Invalid Pagination"),
    limit: z.string("Invalid Limit").regex(DIGITS, "Invalid Pagination").default("12")
        .transform(Number).refine(limit => limit >= 1 && limit <= 50, "Invalid Pagination"),
    search: z.string("Invalid Search").refine(value => !CONTROL_CHARACTER.test(value), "Invalid Search")
        .trim().max(SEARCH_MAX_LENGTH, "Invalid Search").optional(),
    // Muscle and equipment ids are UUIDs; anything else can't match a row.
    muscle: z.string("Invalid Muscle").trim()
        .refine(value => value === "" || z.uuid().safeParse(value).success, "Invalid Muscle").optional(),
    equipment: z.string("Invalid Equipment").trim()
        .refine(value => value === "" || z.uuid().safeParse(value).success, "Invalid Equipment").optional(),
});

export type ExerciseListQuery = z.infer<typeof exerciseListQuery>;
