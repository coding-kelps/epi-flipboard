/*
  Warnings:

  - Added the required column `description` to the `articles` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "articles" ADD COLUMN     "description" TEXT NOT NULL;
