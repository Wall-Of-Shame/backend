-- AlterTable
ALTER TABLE "Challenge" ADD COLUMN     "has_released_result" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "has_veto_ended" BOOLEAN NOT NULL DEFAULT false;
