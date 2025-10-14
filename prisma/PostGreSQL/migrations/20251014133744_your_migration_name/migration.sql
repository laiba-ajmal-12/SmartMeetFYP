/*
  Warnings:

  - You are about to drop the column `ActiveCode` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `ActiveCodeTime` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `accountType` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `active` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `passwordHash` on the `User` table. All the data in the column will be lost.
  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "ActiveCode",
DROP COLUMN "ActiveCodeTime",
DROP COLUMN "accountType",
DROP COLUMN "active",
DROP COLUMN "passwordHash",
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "role" TEXT NOT NULL;
