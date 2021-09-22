-- CreateTable
CREATE TABLE "Vote" (
    "challengeId" TEXT NOT NULL,
    "victimId" TEXT NOT NULL,
    "accuserId" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Vote_challengeId_victimId_accuserId_key" ON "Vote"("challengeId", "victimId", "accuserId");

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("challengeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_victimId_fkey" FOREIGN KEY ("victimId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_accuserId_fkey" FOREIGN KEY ("accuserId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_challengeId_victimId_fkey" FOREIGN KEY ("challengeId", "victimId") REFERENCES "Participant"("challengeId", "userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_challengeId_accuserId_fkey" FOREIGN KEY ("challengeId", "accuserId") REFERENCES "Participant"("challengeId", "userId") ON DELETE RESTRICT ON UPDATE CASCADE;
