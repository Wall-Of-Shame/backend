import parseJSON from "date-fns/parseJSON";
import { Request, Response } from "express";

import { Payload } from "../common/middlewares/checkToken";
import {
  ChallengeData,
  ChallengeId,
  ChallengePost,
} from "../common/types/challenges";
import { handleNotFoundError, handleServerError } from "../common/utils/errors";
import prisma from "../prisma";
import { createChallenge, getChallenge } from "./queries";

export async function create(
  request: Request<{}, {}, ChallengePost, {}>,
  response: Response<{}, Payload>
): Promise<void> {
  try {
    const { userId } = response.locals.payload;

    const { title, description, endAt, type, participants } = request.body;
    const { challengeId } = await createChallenge({
      data: {
        title,
        description,
        endAt: parseJSON(endAt),
        type,
        ownerId: userId,
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
  request: Request<ChallengeId, {}, {}, {}>,
  response: Response<ChallengeData, Payload>
) {
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
      },
    });
    if (!challenge) {
      handleNotFoundError(response, "Challenge was not found.");
      return;
    }

    const { challengeId, title, description, startAt, endAt, type, owner } =
      challenge;
    const { userId, username, name, avatar_animal, avatar_color, avatar_bg } =
      owner;
    // dangerously use !, since it is the last
    // if it doesn't exist, user should be asked to finish their profile before continuing
    response.status(200).send({
      challengeId,
      title,
      description: description ?? undefined,
      startAt: startAt ? startAt.toISOString() : null,
      endAt: endAt.toISOString(),
      type,
      participantCount: 0, // TODO
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
      participants: [], // TODO
    });
    return;
  } catch (e) {
    console.log(e);
    handleServerError(request, response);
    return;
  }
}
