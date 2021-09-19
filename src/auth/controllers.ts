import { Request, Response } from "express";

import { challengeCount } from "../challenges/queries";
import { AuthReq, AuthRes, ErrRes } from "../common/types";
import { createUser, getUser } from "../users/queries";
import { handleInvalidCredentialsError } from "./handlers";
import { getUserToken, validateToken } from "./services";
import { User } from ".prisma/client";

export async function login(
  request: Request<any, any, AuthReq, any>,
  response: Response<AuthRes | ErrRes>
): Promise<void> {
  try {
    const { token: reqToken } = request.body;

    const verifiedToken = await validateToken(reqToken);
    if (!verifiedToken || !verifiedToken.email) {
      handleInvalidCredentialsError(request, response);
      return;
    }

    let user: User | null = await getUser({
      email: verifiedToken.email,
    });
    if (!user) {
      user = await createUser({
        email: verifiedToken.email,
      });
    }

    const token: string = getUserToken(user);

    const {
      userId,
      email,
      username,
      name,
      cfg_deadline_reminder,
      cfg_invites_notif,
    } = user;
    const { completedChallengeCount, failedChallengeCount } =
      await challengeCount(user.userId);
    response.status(200).send({
      token,
      user: {
        userId,
        email,
        username: username ?? undefined,
        name: name ?? undefined,
        completedChallengeCount: username ? completedChallengeCount : undefined,
        failedChallengeCount: username ? failedChallengeCount : undefined,
        settings: {
          deadlineReminder: cfg_deadline_reminder,
          invitations: cfg_invites_notif,
        },
      },
    });
    return;
  } catch (e) {
    console.log("Error: ", e);
    handleInvalidCredentialsError(request, response);
    return;
  }
}
