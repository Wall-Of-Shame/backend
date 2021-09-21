import { Request, Response } from "express";

import { AuthReq, AuthRes, ErrRes } from "../common/types";
import prisma from "../prisma";
import { createUser } from "../users/queries";
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

    const users = await prisma.$queryRaw<
      Array<
        User & {
          failedcount: number;
          completecount: number;
        }
      >
    >`
    SELECT *
      FROM "ParticipationStats"
      WHERE "email" = ${verifiedToken.email}
      LIMIT 1
    `;

    // user should be created or throw
    let user: User & {
      failedcount: number;
      completecount: number;
    };
    if (users.length === 0) {
      user = await createUser({
        email: verifiedToken.email,
      }).then((result) => ({ ...result, failedcount: 0, completecount: 0 }));
    } else {
      user = users[0];
    }

    const token: string = getUserToken(user);

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
      completecount,
      failedcount,
    } = user;
    response.status(200).send({
      token,
      user: {
        userId,
        email,
        username: username ?? undefined,
        name: username && name ? name : undefined,
        completedChallengeCount: username ? completecount : undefined,
        failedChallengeCount: username ? failedcount : undefined,
        avatar: {
          animal: username && avatar_animal ? avatar_animal : undefined,
          color: username && avatar_color ? avatar_color : undefined,
          background: username && avatar_bg ? avatar_bg : undefined,
        },
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
