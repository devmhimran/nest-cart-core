/*
  Warnings:

  - Made the column `publicId` on table `media_library` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "media_library_fileName_key";

-- AlterTable
ALTER TABLE "media_library" ALTER COLUMN "publicId" SET NOT NULL;
