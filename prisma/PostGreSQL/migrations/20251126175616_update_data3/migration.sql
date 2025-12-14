-- AlterTable
ALTER TABLE "Meeting" ADD COLUMN     "Engagment" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "meetingDuration" INTEGER NOT NULL DEFAULT 30,
ADD COLUMN     "meetingLink" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "codeVerified" BOOLEAN;
