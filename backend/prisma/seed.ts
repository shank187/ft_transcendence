import { PrismaClient } from "@prisma/client";

import { seedMuscleGroups } from "./seed-data/muscle-groups";
import { seedEquipment } from "./seed-data/equipment";
import { SeedExercises } from "./seed-data/exercises";
import { seedGyms } from "./seed-data/seedFromGoogleMaps"


const prisma = new PrismaClient();

async function main() {
  await seedMuscleGroups(prisma);
  await seedEquipment(prisma);
  await SeedExercises(prisma);

  await seedGyms(prisma);
}

main()
  .catch((error) => {
    console.error("Database seeding failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });