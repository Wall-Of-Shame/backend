-- CreateEnum
CREATE TYPE "ChallengeType" AS ENUM ('LAST_TO_COMPLETE', 'NOT_COMPLETED');

-- CreateTable
CREATE TABLE "Challenge" (
    "challengeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "endAt" TIMESTAMP(3) NOT NULL,
    "type" "ChallengeType" NOT NULL,

    CONSTRAINT "Challenge_pkey" PRIMARY KEY ("challengeId")
);
