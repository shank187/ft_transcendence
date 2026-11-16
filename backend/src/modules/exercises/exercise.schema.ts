import { z } from "zod";
import { CONTROL_CHARACTER, idParam } from "../../lib/validation";

// The frontend search box has the same maxLength (frontend/src/features/workouts/shared/limits.ts).
const SEARCH_MAX_LENGTH = 100
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
        .refine(value => value === "" || idParam.safeParse(value).success, "Invalid Muscle").optional(),
    equipment: z.string("Invalid Equipment").trim()
        .refine(value => value === "" || idParam.safeParse(value).success, "Invalid Equipment").optional(),
    // gym=true: only exercises doable at the user's current gym. The server reads
    // the gym from the user row, so the client never sends a gym id.
    gym: z.enum(["true", "false"], "Invalid Gym").default("false").transform(value => value === "true"),
    sort: z.enum(["name_asc", "name_desc"], "Invalid Sort").default("name_asc"),
});

export type ExerciseListQuery = z.infer<typeof exerciseListQuery>;
