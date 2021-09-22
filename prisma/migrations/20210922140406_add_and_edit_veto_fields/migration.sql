/*
  Warnings:

  - You are about to drop the column `has_veto_ended` on the `Challenge` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Challenge" DROP COLUMN "has_veto_ended";

-- AlterTable
ALTER TABLE "Participant" ADD COLUMN     "has_been_vetoed" BOOLEAN NOT NULL DEFAULT false;
