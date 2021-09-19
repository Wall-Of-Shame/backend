/*
  Warnings:

  - You are about to drop the column `invite_status` on the `Participant` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Participant" DROP COLUMN "invite_status",
ADD COLUMN     "invited_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "joined_at" DROP NOT NULL,
ALTER COLUMN "joined_at" DROP DEFAULT;

-- DropEnum
DROP TYPE "InviteStatus";
