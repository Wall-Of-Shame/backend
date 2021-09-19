import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import parseJSON from "date-fns/parseJSON";
import { Request, Response } from "express";

import { handleInvalidCredentialsError } from "../auth/handlers";
import { Payload } from "../common/middlewares/checkToken";
import { ErrorCode } from "../common/types";
import {
  ChallengeData,
  ChallengeId,
  ChallengePost,
  UserMini,
} from "../common/types/challenges";
import {
  CustomError,
  handleKnownError,
  handleNotFoundError,
  handleServerError,
} from "../common/utils/errors";
import prisma from "../prisma";
import { createChallenge } from "./queries";
import { isChallengeOver } from "./utils";

export async function create(
  request: Request<any, any, ChallengePost, any>,
  response: Response<any, Payload>
): Promise<void> {
  try {
    const { userId } = response.locals.payload;

    const { title, description, endAt, type, participants } = request.body;

    const participantsMinusOwner = participants.filter((p) => p !== userId);
    const currentDate = new Date();
    const { challengeId } = await createChallenge({
      data: {
        title,
        description,
        endAt: parseJSON(endAt),
        type,
        ownerId: userId,
        participants: {
          createMany: {
            data: [
              ...participantsMinusOwner.map((pId) => ({
                userId: pId,
                joined_at: currentDate,
              })),
              {
                userId: userId,
                joined_at: currentDate,
              },
            ],
            skipDuplicates: true,
          },
        },
      },
      select: {
        challengeId: true,
      },
    });

    response.set("location", "/challenges/" + challengeId);
    response.status(200).send({
      challengeId,
    });
    return;
  } catch (e) {
    console.log(e);
    handleServerError(request, response);
    return;
  }
}

export async function show(
  request: Request<ChallengeId, any, any, any>,
  response: Response<ChallengeData, Payload>
): Promise<void> {
  try {
    const { challengeId: reqChallengeId } = request.params;

    const challenge = await prisma.challenge.findFirst({
      where: {
        challengeId: reqChallengeId,
      },
      include: {
        owner: {
          select: {
            userId: true,
            username: true,
            name: true,
            avatar_animal: true,
            avatar_color: true,
            avatar_bg: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                userId: true,
                username: true,
                name: true,
                avatar_animal: true,
                avatar_color: true,
                avatar_bg: true,
              },
            },
          },
        },
      },
    });
    if (!challenge) {
      handleNotFoundError(response, "Challenge was not found.");
      return;
    }

    const {
      challengeId,
      title,
      description,
      startAt,
      endAt,
      type,
      owner,
      participants,
    } = challenge;
    const { userId, username, name, avatar_animal, avatar_color, avatar_bg } =
      owner;

    const accepted: UserMini[] = [];
    const pending: UserMini[] = [];

    for (const participant of participants) {
      const { username, name, userId, avatar_animal, avatar_color, avatar_bg } =
        participant.user;

      // do not include any users not properly initiated
      if (!username || !name || !avatar_animal || !avatar_color || !avatar_bg) {
        continue;
      }

      const formattedUser: UserMini = {
        userId,
        username,
        name,
        avatar: {
          animal: avatar_animal,
          color: avatar_color,
          background: avatar_bg,
        },
      };

      if (participant.joined_at) {
        accepted.push(formattedUser);
      } else {
        pending.push(formattedUser);
      }
    }

    response.status(200).send({
      challengeId,
      title,
      description: description ?? undefined,
      startAt: startAt ? startAt.toISOString() : null,
      endAt: endAt.toISOString(),
      type,
      participantCount: participants.length,
      owner: {
        userId: userId,
        username: username ?? undefined,
        name: name ?? undefined,
        avatar: {
          animal: avatar_animal ?? undefined,
          color: avatar_color ?? undefined,
          background: avatar_bg ?? undefined,
        },
      },
      participants: {
        accepted,
        pending,
      },
    });
    return;
  } catch (e) {
    console.log(e);
    handleServerError(request, response);
    return;
  }
}

export async function acceptChallenge(
  request: Request<ChallengeId, any, any, any>,
  response: Response<any, Payload>
): Promise<void> {
  try {
    const { userId } = response.locals.payload;
    const { challengeId } = request.params;

    if (!userId) {
      handleInvalidCredentialsError(request, response);
      return;
    }
    if (!challengeId) {
      handleServerError(request, response);
      return;
    }

    const challenge = await prisma.challenge.findUnique({
      where: { challengeId },
      select: { challengeId: true, endAt: true },
    });
    if (!challenge || isChallengeOver(challenge.endAt)) {
      handleKnownError(
        request,
        response,
        new CustomError(ErrorCode.CHALLENGE_OVER, "Challenge is over.")
      );
      return;
    }

    const currentDate = new Date();
    try {
      await prisma.participant.update({
        where: {
          challengeId_userId: {
            challengeId,
            userId,
          },
        },
        data: {
          joined_at: currentDate,
        },
        select: {
          userId: true,
          challengeId: true,
        },
      });
    } catch (e) {
      const error: PrismaClientKnownRequestError = e as any;
      // Participant entry not found - likely to be invited by link
      if (error.code === "P2025") {
        await prisma.participant.create({
          data: {
            userId,
            challengeId,
            joined_at: currentDate,
          },
          select: {
            userId: true,
            challengeId: true,
          },
        });
      } else {
        throw e;
      }
    }

    response.status(200).send({});
    return;
  } catch (e) {
    console.log(e);
    handleServerError(request, response);
    return;
  }
}

export async function rejectChallenge(
  request: Request<ChallengeId, any, any, any>,
  response: Response<{}, Payload>
): Promise<void> {
  try {
    const { userId } = response.locals.payload;
    const { challengeId } = request.params;

    if (!userId) {
      handleInvalidCredentialsError(request, response);
      return;
    }
    if (!challengeId) {
      handleServerError(request, response);
      return;
    }

    const challenge = await prisma.challenge.findUnique({
      where: { challengeId },
      select: { challengeId: true, endAt: true },
    });
    if (!challenge || isChallengeOver(challenge.endAt)) {
      handleKnownError(
        request,
        response,
        new CustomError(ErrorCode.CHALLENGE_OVER, "Challenge is over.")
      );
      return;
    }

    try {
      await prisma.participant.delete({
        where: {
          challengeId_userId: {
            challengeId,
            userId,
          },
        },
      });
    } catch (e) {
      // do nothing
    }

    response.status(200).send({});
    return;
  } catch (e) {
    console.log(e);
    handleServerError(request, response);
    return;
  }
}
