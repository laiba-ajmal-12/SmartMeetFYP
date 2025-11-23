/*
  Warnings:

  - The `codeActivationTime` column on the `Users` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "accountType" TEXT NOT NULL DEFAULT 'Basic',
DROP COLUMN "codeActivationTime",
ADD COLUMN     "codeActivationTime" TIMESTAMP(3);
