/*
  Warnings:

  - You are about to drop the column `role` on the `Users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Meeting" ADD COLUMN     "daily" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "weekly" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Users" DROP COLUMN "role";
