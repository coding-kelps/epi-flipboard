/*
  Warnings:

  - You are about to drop the column `originalUrl` on the `articles` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[original_url]` on the table `articles` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `original_url` to the `articles` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "articles_originalUrl_key";

-- AlterTable
ALTER TABLE "articles" DROP COLUMN "originalUrl",
ADD COLUMN     "original_url" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "articles_original_url_key" ON "articles"("original_url");
