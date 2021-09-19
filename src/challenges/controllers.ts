import parseJSON from "date-fns/parseJSON";
import { Request, Response } from "express";

import { Payload } from "../common/middlewares/checkToken";
import {
  ChallengeData,
  ChallengeId,
  ChallengePost,
  UserMini,
} from "../common/types/challenges";
import { handleNotFoundError, handleServerError } from "../common/utils/errors";
import prisma from "../prisma";
import { createChallenge } from "./queries";
import { InviteStatus } from ".prisma/client";

export async function create(
  request: Request<any, any, ChallengePost, any>,
  response: Response<any, Payload>
): Promise<void> {
  try {
    const { userId } = response.locals.payload;

    const { title, description, endAt, type, participants } = request.body;
    const participantsMinusOwner = participants.filter((p) => p !== userId);
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
                invite_status: InviteStatus.PENDING,
              })),
              {
                userId: userId,
                invite_status: InviteStatus.ACCEPTED,
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

    response.set("Location", "/challenges/" + challengeId);
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

      if (participant.invite_status === InviteStatus.ACCEPTED) {
        accepted.push(formattedUser);
      } else if (participant.invite_status === InviteStatus.PENDING) {
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
