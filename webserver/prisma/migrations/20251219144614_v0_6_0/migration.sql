/*
  Warnings:

  - You are about to drop the column `updated_at` on the `articles` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "articles" DROP COLUMN "updated_at";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "updated_at";
