/*
  Warnings:

  - You are about to drop the column `refresh_expires_at` on the `session` table. All the data in the column will be lost.
  - You are about to drop the column `refresh_token` on the `session` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "session_refresh_token_key";

-- AlterTable
ALTER TABLE "session" DROP COLUMN "refresh_expires_at",
DROP COLUMN "refresh_token";
