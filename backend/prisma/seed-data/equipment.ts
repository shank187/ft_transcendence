import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const EQUIPMENT = [
    "Chest Press Machine",
    "Chest Fly Machine",
    "Dumbbells",
    "Barbell",
    "Plates",
    "Lat Pulldown Machine",
    "T-Bar Row Machine",
    "Cable Machine",
    "Leg Press Machine",
    "Leg Extension Machine",
    "Smith Machine",
    "Leg Curl Machine",
    "Rope",
    "Bench",
    "Ab Crunch Machine"
] as const;

export type EquipmentName = typeof EQUIPMENT[number];

async function seedEquipment() {
    await prisma.equipment.createMany({
        data: EQUIPMENT.map((name) => ({
            name,
        })),
        skipDuplicates: true
    });
}
