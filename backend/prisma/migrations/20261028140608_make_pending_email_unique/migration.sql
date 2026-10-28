/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `PendingRegistration` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "PendingRegistration_email_key" ON "PendingRegistration"("email");
