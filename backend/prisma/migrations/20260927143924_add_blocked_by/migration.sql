/*
  Warnings:

  - You are about to drop the `ConversationMember` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[user1Id,user2Id]` on the table `Conversation` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `user1Id` to the `Conversation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user2Id` to the `Conversation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ConversationMember" DROP CONSTRAINT "ConversationMember_conversationId_fkey";

-- DropForeignKey
ALTER TABLE "ConversationMember" DROP CONSTRAINT "ConversationMember_userId_fkey";

-- DropIndex
DROP INDEX "Message_senderId_idx";

-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "user1Id" TEXT NOT NULL,
ADD COLUMN     "user2Id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Friendship" ADD COLUMN     "blockedById" TEXT;

-- DropTable
DROP TABLE "ConversationMember";

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_user1Id_user2Id_key" ON "Conversation"("user1Id", "user2Id");

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_user1Id_fkey" FOREIGN KEY ("user1Id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_user2Id_fkey" FOREIGN KEY ("user2Id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
