import parseJSON from "date-fns/parseJSON";
import { Request, Response } from "express";

import { Payload } from "../common/middlewares/checkToken";
import {
  ChallengeData,
  ChallengeId,
  ChallengePost,
} from "../common/types/challenges";
import { handleNotFoundError, handleServerError } from "../common/utils/errors";
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

    const challenge = await getChallenge({
      where: {
        challengeId: reqChallengeId,
      },
    });
    if (!challenge) {
      handleNotFoundError(response, "Challenge was not found.");
      return;
    }

    const { challengeId, title, description, startAt, endAt, type } = challenge;
    response.status(200).send({
      challengeId,
      title,
      description: description ?? undefined,
      startAt: startAt ? startAt.toISOString() : null,
      endAt: endAt.toISOString(),
      type,
      participantCount: 0, // TODO
      owner: {
        userId: "Unsupported",
        username: "unsupported",
        name: "unsupprted",
        avatar: {
          animal: "CAT",
          color: "BROWN",
          background: "#ffffff",
        },
      },
      participants: [], // TODO
    });
  } catch (e) {
    console.log(e);
    handleServerError(request, response);
    return;
  }
}
