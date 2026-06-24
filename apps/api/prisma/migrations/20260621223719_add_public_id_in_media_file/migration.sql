/*
  Warnings:

  - A unique constraint covering the columns `[publicId]` on the table `media_library` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "media_library" ADD COLUMN     "publicId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "media_library_publicId_key" ON "media_library"("publicId");
