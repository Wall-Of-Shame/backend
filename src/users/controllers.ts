import { User } from "@prisma/client";
import { Request, Response } from "express";

import { Payload } from "../common/middlewares/checkToken";
import { UserPatch, UserData, ErrorCode } from "../common/types";
import { UserFriends, UserList, UserListQuery } from "../common/types/users";
import {
  CustomError,
  handleKnownError,
  handleServerError,
  handleUnauthRequest,
} from "../common/utils/errors";
import prisma from "../prisma";
import { patchUser } from "./queries";
import {
  getGlobalWall,
  getUserRecents,
  getUserWall,
  searchUsers,
} from "./services";

export async function index(
  request: Request<any, any, any, UserListQuery>,
  response: Response<UserList[], Payload>
): Promise<void> {
  try {
    const { userId } = response.locals.payload;
    const { operation } = request.query;

    if (operation === "search" && request.query.query) {
      const result: UserList[] = await searchUsers(request.query.query);
      response.status(200).send(result);
      return;
    } else if (operation === "wallGlobal") {
      const shamedList: UserList[] = await getGlobalWall();
      response.status(200).send(shamedList);
      return;
    } else if (operation === "wallRecents") {
      const shamedList: UserList[] = await getUserWall(userId);
      response.status(200).send(shamedList);
      return;
    } else {
      handleKnownError(
        request,
        response,
        new CustomError(
          ErrorCode.INVALID_REQUEST,
          "The provided operation is not recognised"
        )
      );
      return;
    }
  } catch (e) {
    console.log(e);
    handleServerError(request, response);
    return;
  }
}

export async function indexFriends(
  request: Request<any, any, any, any>,
  response: Response<UserFriends[], Payload>
): Promise<void> {
  try {
    const { userId } = response.locals.payload;
    const recents: UserFriends[] = await getUserRecents(userId);
    response.status(200).send(recents);
    return;
  } catch (e) {
    console.log(e);
    const knownError: Error = e as any;
    switch (knownError.name) {
      case ErrorCode.UNAUTHORIZED:
        handleUnauthRequest(response);
        return;
      default:
        handleServerError(request, response);
        return;
    }
  }
}

export async function show(
  request: Request<any, any, any, any>,
  response: Response<UserData, Payload>
): Promise<void> {
  try {
    const { userId: reqUserId } = response.locals.payload;

    const users = await prisma.$queryRaw<
      Array<
        User & {
          failedcount: number;
          completecount: number;
          vetoedcount: number;
        }
      >
    >`
    SELECT *
      FROM "ParticipationStats"
      WHERE "userId" = ${reqUserId}
      LIMIT 1
    `;

    if (users.length === 0) {
      handleUnauthRequest(response);
      return;
    }

    const user = users[0];
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
      vetoedcount,
    } = user;
    response.status(200).send({
      userId,
      email,
      username: username ?? undefined,
      name: username && name ? name : undefined,
      completedChallengeCount: username ? completecount : undefined,
      failedChallengeCount: username ? failedcount : undefined,
      vetoedChallengeCount: username ? vetoedcount : undefined,
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
