/*
  Warnings:

  - The primary key for the `feeds` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `created_at` on the `feeds` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `feeds` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `feeds` table. All the data in the column will be lost.
  - You are about to alter the column `user_id` on the `feeds` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - A unique constraint covering the columns `[name]` on the table `feeds` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "feeds" DROP CONSTRAINT "feeds_pkey",
DROP COLUMN "created_at",
DROP COLUMN "id",
DROP COLUMN "updated_at",
ADD COLUMN     "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "feed_id" SERIAL NOT NULL,
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "user_id" SET DATA TYPE INTEGER,
ADD CONSTRAINT "feeds_pkey" PRIMARY KEY ("feed_id");

-- CreateIndex
CREATE UNIQUE INDEX "feeds_name_key" ON "feeds"("name");
