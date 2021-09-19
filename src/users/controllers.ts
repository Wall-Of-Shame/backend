import { User } from "@prisma/client";
import { Request, Response } from "express";

import { challengeCount } from "../challenges/queries";
import { Payload } from "../common/middlewares/checkToken";
import { UserPatch, UserData } from "../common/types";
import {
  handleNotFoundError,
  handleServerError,
  handleUnauthRequest,
} from "../common/utils/errors";
import { getUser, patchUser } from "./queries";

export async function show(
  request: Request<any, any, any, any>,
  response: Response<UserData, Payload>
): Promise<void> {
  try {
    const user: User | null = await getUser({
      userId: response.locals.payload.userId,
    });
    if (!user) {
      handleUnauthRequest(response);
      return;
    }

    const {
      userId,
      email,
      username,
      name,
      cfg_deadline_reminder,
      cfg_invites_notif,
      avatar_animal,
      avatar_color,
      avatar_bg,
    } = user;
    const { completedChallengeCount, failedChallengeCount } =
      await challengeCount(userId);
    response.status(200).send({
      userId,
      email,
      username: username ?? undefined,
      name: username && name ? name : undefined,
      completedChallengeCount: username ? completedChallengeCount : undefined,
      failedChallengeCount: username ? failedChallengeCount : undefined,
      avatar: {
        animal: username && avatar_animal ? avatar_animal : undefined,
        color: username && avatar_color ? avatar_color : undefined,
        background: username && avatar_bg ? avatar_bg : undefined,
      },
      settings: {
        deadlineReminder: cfg_deadline_reminder,
        invitations: cfg_invites_notif,
      },
    });
    return;
  } catch (e) {
    console.log(e);
    handleServerError(request, response);
    return;
  }
}

export async function update(
  request: Request<any, any, UserPatch, any>,
  response: Response<Record<string, never>, Payload>
): Promise<void> {
  try {
    const { userId } = response.locals.payload;

    await patchUser(userId, request.body);
    response.status(204).send({});
    // TODO: add 404
    return;
  } catch (e) {
    handleServerError(request, response);
    return;
  }
}
