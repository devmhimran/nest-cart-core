/*
  Warnings:

  - Changed the type of `action` on the `AuditLog` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `entity` on the `AuditLog` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'RESTORE', 'LOGIN', 'SIGNOUT');

-- CreateEnum
CREATE TYPE "EntityType" AS ENUM ('USER', 'SIZE', 'COLOR', 'PRODUCT', 'CATEGORY', 'ORDER', 'BANNER', 'PROMO_CODE');

-- AlterTable
ALTER TABLE "AuditLog" DROP COLUMN "action",
ADD COLUMN     "action" "AuditAction" NOT NULL,
DROP COLUMN "entity",
ADD COLUMN     "entity" "EntityType" NOT NULL;

-- AlterTable
ALTER TABLE "UserSession" ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT;
