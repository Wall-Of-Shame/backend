import { Request, Response } from "express";

import { Payload } from "../../common/middlewares/checkToken";
import { ErrorCode } from "../../common/types";
import { ChallengeId } from "../../common/types/challenges";
import { VoteList, VotePost } from "../../common/types/votes";
import {
  CustomError,
  handleKnownError,
  handleNotFoundError,
  handleServerError,
} from "../../common/utils/errors";
import prisma from "../../prisma";
import { isChallengeOver } from "../utils";

function countAccusers(
  votes: {
    victimId: string;
    accuserId: string;
  }[]
): Map<string, string[]> {
  const map: Map<string, string[]> = new Map();
  for (const v of votes) {
    if (map.has(v.victimId)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const list = map.get(v.victimId)!;
      list.push(v.accuserId);
      map.set(v.victimId, list);
    } else {
      map.set(v.victimId, [v.accuserId]);
    }
  }
  return map;
}

export async function submitVote(
  request: Request<ChallengeId, any, VotePost, any>,
  response: Response<any, Payload>
): Promise<void> {
  try {
    const { challengeId } = request.params;
    const { userId: accuserId } = response.locals.payload;
    const { victimId } = request.body;

    // validate
    try {
      if (!challengeId || !accuserId || !victimId) {
        handleKnownError(
          request,
          response,
          new CustomError(
            ErrorCode.INVALID_REQUEST,
            "Request body is malformed."
          )
        );
        return;
      }
      if (accuserId === victimId) {
        handleKnownError(
          request,
          response,
          new CustomError(
            ErrorCode.INVALID_REQUEST,
            "Cannot vote for yourself."
          )
        );
        return;
      }

      const doTheyExist = await prisma.participant
        .count({
          where: {
            challengeId,
            OR: [{ userId: accuserId }, { userId: victimId }],
          },
        })
        .then((count) => count === 2);
      if (!doTheyExist) {
        handleKnownError(
          request,
          response,
          new CustomError(ErrorCode.INVALID_REQUEST, "Invalid users.")
        );
        return;
      }

      const challenge = await prisma.challenge.findFirst({
        where: { challengeId },
        select: { endAt: true },
      });
      if (!challenge || !isChallengeOver(challenge.endAt)) {
        handleKnownError(
          request,
          response,
          new CustomError(ErrorCode.INVALID_REQUEST, "Challenge is not over.")
        );
        return;
      }
    } catch (e) {
      console.log(e);
      handleServerError(request, response);
      return;
    }

    try {
      const existingVote = await prisma.vote.findUnique({
        where: {
          challengeId_victimId_accuserId: {
            challengeId,
            victimId,
            accuserId,
          },
        },
      });

      if (existingVote) {
        response.status(200).json({});
        return;
      } else {
        await prisma.vote.create({
          data: {
            victimId,
            accuserId,
            challengeId,
          },
        });
        response.status(200).json({});
        return;
      }
    } catch (e) {
      console.log(e);
      handleServerError(request, response);
      return;
    }
  } catch (e) {
    console.log(e);
    handleServerError(request, response);
    return;
  }
}

export async function showVotes(
  request: Request<ChallengeId, any, any, any>,
  response: Response<VoteList, Payload>
): Promise<void> {
  try {
    const { challengeId } = request.params;
    const { userId } = response.locals.payload;

    // validate
    try {
      const isParticipant = await prisma.participant
        .count({
          where: {
            challengeId,
            userId,
          },
        })
        .then((count) => count === 1);
      if (!isParticipant) {
        handleKnownError(
          request,
          response,
          new CustomError(
            ErrorCode.INVALID_REQUEST,
            "User is not part of this challenge."
          )
        );
        return;
      }
    } catch (e) {
      console.log(e);
      handleKnownError(
        request,
        response,
        new CustomError(
          ErrorCode.INVALID_REQUEST,
          "User is not part of this challenge."
        )
      );
    }

    const challenge = await prisma.challenge.findUnique({
      where: { challengeId },
      include: {
        votes: {
          select: {
            victimId: true,
            accuserId: true,
          },
        },
        participants: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!challenge) {
      handleNotFoundError(response, "Challenge was not found.");
      return;
    }

    const countMap = countAccusers(challenge.votes);
    const result: VoteList = challenge.participants
      .filter((p) => p.joined_at)
      .map((p) => ({
        victim: {
          userId: p.userId,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          username: p.user.username!,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          name: p.user.name!,
          evidenceLink: p.evidence_link ?? undefined,
        },
        accusers: countMap.get(p.userId) ?? [],
      }));

    response.status(200).send(result);
    return;
  } catch (e) {
    console.log(e);
    handleServerError(request, response);
    return;
  }
}
