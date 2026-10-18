import type { ListQuery, ParseListQueryReturn } from "./exercise.types";

export function parseListQuery(q: Record<string, unknown>): ParseListQueryReturn {
    // reject repeated keys (Express turns them into arrays)
    if (q.muscle !== undefined && typeof q.muscle !== "string") {
        return { ok: false, message: "Invalid Muscle" }
    }
    if (q.search !== undefined && typeof q.search !== "string") {
        return { ok: false, message: "Invalid Search" }
    }
    if (q.equipment !== undefined && typeof q.equipment !== "string") {
        return { ok: false, message: "Invalid Equipment" }
    }
    if (q.page !== undefined && typeof q.page !== "string") {
        return { ok: false, message: "Invalid Page" }
    }
    if (q.limit !== undefined && typeof q.limit !== "string") {
        return { ok: false, message: "Invalid Limit" }
    }
    // set queries to Default
    const rawPage = typeof q.page === "string" ? q.page : "1"
    const rawLimit = typeof q.limit === "string" ? q.limit : "12"
    const rawMuscle = typeof q.muscle === "string" ? q.muscle : ""
    const rawEquipment = typeof q.equipment === "string" ? q.equipment : ""
    const rawSearch = typeof q.search === "string" ? q.search : ""

    const page = Number(rawPage)
    const limit = Number(rawLimit)

    if (!Number.isInteger(page) || !Number.isInteger(limit) || page < 1 || limit < 1 || limit > 50) {
        return { ok: false, message: "Invalid Pagination" }
    }
    const value: ListQuery = { page, limit }

    if (rawSearch.trim().length > 0)
        value.search = rawSearch.trim()
    if (rawMuscle.trim().length > 0)
        value.muscle = rawMuscle.trim()
    if (rawEquipment.trim().length > 0)
        value.equipment = rawEquipment.trim()

    return { ok: true, value };
}
