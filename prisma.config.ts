import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  adapter: new PgDialect({
    url: process.env.DATABASE_URL!,
  }),
})