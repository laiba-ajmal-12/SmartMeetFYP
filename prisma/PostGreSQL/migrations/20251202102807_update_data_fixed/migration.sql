/*
  Warnings:

  - You are about to drop the column `endTime` on the `Meeting` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Meeting" DROP COLUMN "endTime",
ADD COLUMN     "EnableEngagement" BOOLEAN NOT NULL DEFAULT true;
