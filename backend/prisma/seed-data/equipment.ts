import { PrismaClient } from "@prisma/client";


export const EQUIPMENT = [
    { name: "Chest Press Machine", category: "MACHINES" },
    { name: "Chest Fly Machine", category: "MACHINES" },
    { name: "Dumbbells", category: "FREE_WEIGHTS" },
    { name: "Barbell", category: "FREE_WEIGHTS" },
    { name: "Plates", category: "FREE_WEIGHTS" },
    { name: "Lat Pulldown Machine", category: "MACHINES" },
    { name: "T-Bar Row Machine", category: "MACHINES" },
    { name: "Cable Machine", category: "CABLES_ATTACHMENTS" },
    { name: "Leg Press Machine", category: "MACHINES" },
    { name: "Leg Extension Machine", category: "MACHINES" },
    { name: "Smith Machine", category: "BENCHES_RACKS" },
    { name: "Leg Curl Machine", category: "MACHINES" },
    { name: "Rope", category: "CABLES_ATTACHMENTS" },
    { name: "Bench", category: "BENCHES_RACKS" },
    { name: "Ab Crunch Machine", category: "MACHINES" }
] as const;

export type EquipmentName = typeof EQUIPMENT[number]["name"];

// Upsert so databases seeded before categories existed get them too.
export async function seedEquipment(prisma: PrismaClient) {
    for (const { name, category } of EQUIPMENT) {
        await prisma.equipment.upsert({
            where: { name },
            update: { category },
            create: { name, category },
        });
    }
}
