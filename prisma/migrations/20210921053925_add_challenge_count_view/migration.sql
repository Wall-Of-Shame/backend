-- Create view for challenge count
CREATE OR REPLACE VIEW "ParticipationStats" AS 
WITH 
pfailed AS
(
         SELECT   p."userId",
                  Count(p."challengeId") AS failedcount
         FROM     "Participant" p
         WHERE    p."joined_at" IS NOT NULL
         AND      EXISTS
                  (
                         SELECT 1
                         FROM   "Challenge" c
                         WHERE  p."challengeId" = c."challengeId"
                         AND    c."endAt" <= Now()::timestamp)
         AND      p."completed_at" IS NOT NULL
         GROUP BY p."userId"), 
pcomplete AS
(
         SELECT   p."userId",
                  Count(p."challengeId") AS completecount
         FROM     "Participant" p
         WHERE    p."joined_at" IS NOT NULL
         AND      EXISTS
                  (
                         SELECT 1
                         FROM   "Challenge" c
                         WHERE  p."challengeId" = c."challengeId"
                         AND    c."endAt" <= Now()::timestamp)
         AND      p."completed_at" IS NULL
         GROUP BY p."userId")
		 
SELECT    u.*,
          COALESCE(pf.failedcount, 0)   AS failedcount,
          COALESCE(pc.completecount, 0) AS completecount
FROM      "User" u 
natural left JOIN pfailed pf 
natural left JOIN pcomplete pc;