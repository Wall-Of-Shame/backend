-- Fix view for challenge count
DROP VIEW IF EXISTS "ParticipationStats";
CREATE VIEW "ParticipationStats" AS 
WITH participanttblextended AS
(
    SELECT    *
    FROM      "Participant" p
    LEFT JOIN "Challenge" c
    ON        p."challengeId" = c."challengeId"
    WHERE     c."endAt" <= (Now() - interval '8' hour)
    AND       joined_at IS NOT NULL)
SELECT *,
    (
            SELECT Count(*)
            FROM   participanttblextended t1
            WHERE  t1."userId" = u."userId"
            AND    t1."completed_at" IS NULL ) AS failedcount,
    (
            SELECT Count(*)
            FROM   participanttblextended t1
            WHERE  t1."userId" = u."userId"
            AND    t1."completed_at" IS NOT NULL
            AND    NOT t1."has_been_vetoed" ) AS completecount,
    (
            SELECT Count(*)
            FROM   participanttblextended t1
            WHERE  t1."userId" = u."userId"
            AND    t1."completed_at" IS NOT NULL
            AND    t1."has_been_vetoed" ) AS vetoedcount
FROM    "User" u;