/*
  Warnings:

  - A unique constraint covering the columns `[organizationCode]` on the table `Organization` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `organizationCode` to the `Organization` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "domainName" TEXT,
ADD COLUMN     "domainRestrictionFlag" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "organizationCode" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Organization_organizationCode_key" ON "Organization"("organizationCode");
