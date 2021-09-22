import parseJSON from "date-fns/parseJSON";
import { Request, Response } from "express";

import { Payload } from "../../common/middlewares/checkToken";
import { ErrorCode } from "../../common/types";
import { ChallengeId } from "../../common/types/challenges";
import { ChallengeVotePost } from "../../common/types/votes";
import {
  CustomError,
  handleKnownError,
  handleServerError,
} from "../../common/utils/errors";
import prisma from "../../prisma";
import { isChallengeOver } from "../utils";

export async function submitVote(
  request: Request<ChallengeId, any, ChallengeVotePost, any>,
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

      const doTheyExist = await prisma.user
        .count({
          where: {
            OR: [{ userId: accuserId }, { userId: victimId }],
          },
        })
        .then((count) => count === 2);
      if (!doTheyExist) {
        handleKnownError(
          request,
          response,
          new CustomError(ErrorCode.INVALID_REQUEST, "Invalid userIds.")
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
