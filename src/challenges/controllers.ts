import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import parseJSON from "date-fns/parseJSON";
import { Request, Response } from "express";

import { handleInvalidCredentialsError } from "../auth/handlers";
import { Payload } from "../common/middlewares/checkToken";
import { ErrorCode } from "../common/types";
import {
  ChallengeData,
  ChallengeId,
  ChallengePatch,
  ChallengePost,
  UserMini,
} from "../common/types/challenges";
import {
  CustomError,
  handleKnownError,
  handleNotFoundError,
  handleServerError,
  handleUnauthRequest,
} from "../common/utils/errors";
import prisma from "../prisma";
import { createChallenge } from "./queries";
import { isChallengeOver, isChallengeRunning, isStartBeforeEnd } from "./utils";
import { Prisma } from ".prisma/client";

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

// show challenge.
// no check for user - since the id is uuid, hard to forge a random challengeId unless you are sent one
// no check also because user may want to see it before accepting
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

// update challenge
// only allow owner to update challenge
export async function update(
  request: Request<ChallengeId, any, ChallengePatch, any>,
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
      include: {
        participants: {
          select: {
            userId: true,
          },
        },
      },
    });
    if (!challenge) {
      handleNotFoundError(response, "Challenge was not found.");
      return;
    }
    if (isChallengeOver(challenge.endAt)) {
      handleKnownError(
        request,
        response,
        new CustomError(ErrorCode.CHALLENGE_OVER, "Challenge is over.")
      );
      return;
    }
    if (challenge.ownerId !== userId) {
      handleUnauthRequest(response);
      return;
    }

    try {
      const { title, description, startAt, endAt, type, participants } =
        request.body;

      const startAtDate: Date | null = startAt
        ? parseJSON(startAt)
        : challenge.startAt;
      const endAtDate: Date | null = endAt ? parseJSON(endAt) : challenge.endAt;
      if (!isStartBeforeEnd(startAtDate, endAtDate)) {
        handleKnownError(
          request,
          response,
          new CustomError(
            ErrorCode.INVALID_REQUEST,
            "Start has to be before end."
          )
        );
        return;
      }

      const args: Prisma.ChallengeUpdateArgs = {
        where: {
          challengeId,
        },
        data: {
          title: title ?? challenge.title,
          description: description ?? challenge.description,
          startAt: startAtDate,
          endAt: endAtDate,
          type: type ?? challenge.type,
        },
      };
      if (participants) {
        args.data["participants"] = {
          // new participant: exists in the input list, but not in the existing list
          createMany: {
            data: participants
              .filter(
                (inputId) =>
                  !challenge.participants.includes({ userId: inputId })
              )
              .map((pid) => ({ userId: pid })),
          },
          // removed participant: exists in the existing list, not in the input list
          // do not delete owner as participant
          deleteMany: challenge.participants
            .filter((existing) => !participants.includes(existing.userId))
            .filter((existing) => existing.userId !== challenge.ownerId),
        };
      }

      await prisma.challenge.update(args);
      response.status(200).send({});
      return;
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

// remove challenge
// only allow owner to remove challenge
export async function remove(
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
      select: { challengeId: true, endAt: true, ownerId: true },
    });
    if (!challenge || isChallengeOver(challenge.endAt)) {
      handleKnownError(
        request,
        response,
        new CustomError(ErrorCode.CHALLENGE_OVER, "Challenge is over.")
      );
      return;
    }
    if (challenge.ownerId !== userId) {
      handleUnauthRequest(response);
      return;
    }

    try {
      await prisma.$transaction([
        prisma.participant.deleteMany({
          where: {
            challengeId,
          },
        }),
        prisma.challenge.delete({
          where: {
            challengeId,
          },
        }),
      ]);

      response.status(200).send({});
      return;
    } catch {
      handleServerError(request, response);
      return;
    }
  } catch (e) {
    console.log(e);
    handleServerError(request, response);
    return;
  }
}

// accept challenge
// creates underlying participant instance if (1) already added or (2) user got hold of challengeId
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

// reject challenge
// tries to delete challenge if the user is (1) invited or (2) has prev accepted
// if not met, just fails gracefully and return 200
export async function rejectChallenge(
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

// complete challenge
// completes challenge if the user has accepted ^ challenge has started
export async function completeChallenge(
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

    const participant = await prisma.participant.findFirst({
      where: {
        challengeId,
        userId,
      },
      include: {
        challenge: {
          select: {
            challengeId: true,
            startAt: true,
            endAt: true,
          },
        },
      },
    });
    if (!participant || participant.invited_at === null) {
      handleNotFoundError(response, "User has not accepted this challenge.");
      return;
    }
    if (
      !isChallengeRunning(
        participant.challenge.startAt,
        participant.challenge.endAt
      )
    ) {
      handleKnownError(
        request,
        response,
        new CustomError(
          ErrorCode.CHALLENGE_NOT_RUNNING,
          "Challenge is not running."
        )
      );
      return;
    }

    let didUpdate = false;
    try {
      await prisma.participant.update({
        where: {
          challengeId_userId: {
            challengeId,
            userId,
          },
        },
        data: {
          completed_at: new Date(),
        },
        select: {
          userId: true,
          challengeId: true,
        },
      });
      didUpdate = true;
    } catch (e) {
      didUpdate = false;
    }

    if (didUpdate) {
      response.status(200).send({});
      return;
    } else {
      handleNotFoundError(response, "User has not accepted this challenge.");
      return;
    }
  } catch (e) {
    console.log(e);
    handleServerError(request, response);
    return;
  }
}
