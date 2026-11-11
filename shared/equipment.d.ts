// What the equipment API sends. Read by the backend and the frontend; see workouts.d.ts.

// Same values as the EquipmentCategory enum in backend/prisma/schema.prisma.
export type EquipmentCategory =
    | "FREE_WEIGHTS" | "BENCHES_RACKS" | "MACHINES" | "CABLES_ATTACHMENTS"
    | "CARDIO" | "ACCESSORIES" | "OTHER"

// GET /api/equipment
export interface EquipmentItem
{
    id: string,
    name: string,
    category: EquipmentCategory,
}
