/*
  Warnings:

  - You are about to drop the column `createdAt` on the `followed_feeds` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "followed_feeds" DROP COLUMN "createdAt",
ADD COLUMN     "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "last_visit" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP;
