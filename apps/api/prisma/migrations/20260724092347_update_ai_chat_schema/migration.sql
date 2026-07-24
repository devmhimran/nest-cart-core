/*
  Warnings:

  - You are about to drop the column `toolCalls` on the `chat_message` table. All the data in the column will be lost.
  - Changed the type of `role` on the `chat_message` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "MessageRole" AS ENUM ('USER', 'ASSISTANT', 'TOOL', 'SYSTEM');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- DropForeignKey
ALTER TABLE "chat_session" DROP CONSTRAINT "chat_session_userId_fkey";

-- AlterTable
ALTER TABLE "chat_message" DROP COLUMN "toolCalls",
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "status" "MessageStatus" NOT NULL DEFAULT 'COMPLETED',
DROP COLUMN "role",
ADD COLUMN     "role" "MessageRole" NOT NULL;

-- AlterTable
ALTER TABLE "chat_session" ADD COLUMN     "lastMessageAt" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "chat_session" ADD CONSTRAINT "chat_session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
