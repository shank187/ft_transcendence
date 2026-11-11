import type { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import type { EquipmentItem } from "./equipment.types";

const equipmentSelect = {
    id: true,
    name: true,
    category: true,
} satisfies Prisma.EquipmentSelect;

type EquipmentRowDb = Prisma.EquipmentGetPayload<{ select: typeof equipmentSelect }>;

function toEquipmentItemDto(row: EquipmentRowDb): EquipmentItem
{
    return {
        id: row.id,
        name: row.name,
        category: row.category,
    }
}

// PostgreSQL sorts an enum column in the enum's declared order, not alphabetically.
export async function getEquipment(): Promise<EquipmentItem[]>
{
    const rows = await prisma.equipment.findMany({
        orderBy: [{ category: "asc" }, { name: "asc" }],
        select: equipmentSelect,
    })
    return rows.map(toEquipmentItemDto)
}
