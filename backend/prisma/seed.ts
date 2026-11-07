import { PrismaClient } from "@prisma/client";

import { seedMuscleGroups } from "./seed-data/muscle-groups";
import { seedEquipment } from "./seed-data/equipment";
import { SeedExercises } from "./seed-data/exercises";
import { seedUnverifiedGyms  } from "./seed-data/seedFromGoogleMaps";
import { seedAdmin } from "./seed-data/admin";
import {seedVerifiedGyms} from "./seed-data/seedVerifiedGyms"


const prisma = new PrismaClient();

async function main() {
  await seedMuscleGroups(prisma);
  await seedEquipment(prisma);
  await SeedExercises(prisma);
  
  await seedAdmin(prisma);
  await seedVerifiedGyms(prisma);
  await seedUnverifiedGyms(prisma);

}

main()
  .catch((error) => {
    console.error("Database seeding failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });