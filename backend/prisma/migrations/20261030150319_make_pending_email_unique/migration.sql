/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `PendingRegistration` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex

DELETE FROM "PendingRegistration"
WHERE "id" NOT IN (
    SELECT DISTINCT ON ("email") "id"
    FROM "PendingRegistration"
    ORDER BY "email", "createdAt" DESC
);

CREATE UNIQUE INDEX "PendingRegistration_email_key" ON "PendingRegistration"("email");
