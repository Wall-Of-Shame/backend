import { Prisma, User } from "@prisma/client";

import {
  getParticipationStats,
  validParticipationFilter,
} from "../challenges/utils";
import { ErrorCode } from "../common/types";
import { UserFriends, UserList } from "../common/types/users";
import { CustomError } from "../common/utils/errors";
import prisma from "../prisma";

export async function getUserRecents(userId: string): Promise<UserFriends[]> {
  const isValidUser: boolean = await prisma.user
    .count({
      where: { userId },
    })
    .then((count) => count === 1);
  if (!isValidUser) {
    // to be caught and handled by callee
    throw new CustomError(ErrorCode.UNAUTHORIZED, "Unauthorised request.");
  }

  const raw = await prisma.contact.findMany({
    where: {
      pers1_id: userId,
    },
    include: {
      pers2: {
        include: {
          // count the list of participant instances
          participating_in: {
            where: validParticipationFilter,
          },
        },
      },
    },
  });

  const recents: UserList[] = raw.map((contact) => {
    const { userId, username, name, avatar_animal, avatar_color, avatar_bg } =
      contact.pers2;
    const {
      completedChallengeCount,
      failedChallengeCount,
      vetoedChallengeCount,
    } = getParticipationStats(contact.pers2.participating_in);
    // allow for ! here, since on creation this will be checked
    // see `challenges#accept` and `challenges#create` and `challenges#patch`
    /* eslint-disable @typescript-eslint/no-non-null-assertion*/
    return {
      userId,
      username: username!,
      name: name!,
      avatar: {
        animal: avatar_animal!,
        color: avatar_color!,
        background: avatar_bg!,
      },
      completedChallengeCount,
      failedChallengeCount,
      vetoedChallengeCount,
    };
    /* eslint-enable @typescript-eslint/no-non-null-assertion*/
  });

  return recents;
}

export async function searchUsers(query: string): Promise<UserList[]> {
  const raw = await prisma.user.findMany({
    where: {
      AND: [
        { username: { not: null } },
        { name: { not: null } },
        { avatar_animal: { not: null } },
        { avatar_bg: { not: null } },
        { avatar_color: { not: null } },
        {
          OR: [
            { username: { contains: query } },
            { name: { contains: query } },
          ],
        },
      ],
    },
    orderBy: {
      username: "asc",
    },
    include: {
      // count the list of participant instances
      participating_in: {
        where: validParticipationFilter,
      },
    },
  });
  const result: UserList[] = raw.map((v) => {
    const { userId, username, name, avatar_animal, avatar_color, avatar_bg } =
      v;
    const {
      completedChallengeCount,
      failedChallengeCount,
      vetoedChallengeCount,
    } = getParticipationStats(v.participating_in);
    // checked via the prisma query
    /* eslint-disable @typescript-eslint/no-non-null-assertion*/
    return {
      userId,
      username: username!,
      name: name!,
      avatar: {
        animal: avatar_animal!,
        color: avatar_color!,
        background: avatar_bg!,
      },
      completedChallengeCount,
      failedChallengeCount,
      vetoedChallengeCount,
    };
    /* eslint-enable @typescript-eslint/no-non-null-assertion*/
  });
  return result;
}

export async function getGlobalWall(): Promise<UserList[]> {
  // TODO: add AND failedCount > 0
  // leaving it for testing purposes
  const raw = await prisma.$queryRaw<
    Array<
      Required<User> & {
        failedcount: number;
        completecount: number;
        vetoedcount: number;
        totalfailedcount: number;
      }
    >
  >`
    SELECT *
      FROM "ParticipationStats"
      WHERE "username" IS NOT NULL
        AND "name" IS NOT NULL
        AND "avatar_animal" IS NOT NULL
        AND "avatar_color" IS NOT NULL
        AND "avatar_bg" IS NOT NULL
        AND "totalfailedcount" > 0
      ORDER BY totalfailedcount DESC, username ASC
      LIMIT 100
  `;
  // checked via the prisma query
  /* eslint-disable @typescript-eslint/no-non-null-assertion*/
  const result: UserList[] = raw.map((r) => ({
    userId: r.userId,
    username: r.username!,
    name: r.name!,
    email: r.email!,
    avatar: {
      animal: r.avatar_animal!,
      color: r.avatar_color!,
      background: r.avatar_bg!,
    },
    completedChallengeCount: r.completecount,
    failedChallengeCount: r.failedcount,
    vetoedChallengeCount: r.vetoedcount,
  }));
  /* eslint-enable @typescript-eslint/no-non-null-assertion*/
  return result;
}

export async function getUserWall(userId: string): Promise<UserList[]> {
  // TODO: add AND failedCount > 0
  // leaving it for testing purposes

  const recentIds: string[] = await prisma.contact
    .findMany({
      where: { pers1_id: userId },
      select: {
        pers2_id: true,
      },
    })
    .then((result) => result.map((v) => v.pers2_id));

  if (recentIds.length === 0) {
    // prisma .join with In doesnt allow for empty error
    return [];
  }

  const raw = await prisma.$queryRaw<
    Array<
      Required<User> & {
        failedcount: number;
        completecount: number;
        vetoedCount: number;
        totalfailedcount: number;
      }
    >
  >`
  SELECT *
    FROM "ParticipationStats"
    WHERE "username" IS NOT NULL
      AND "name" IS NOT NULL
      AND "avatar_animal" IS NOT NULL
      AND "avatar_color" IS NOT NULL
      AND "avatar_bg" IS NOT NULL
      AND "userId" IN (${Prisma.join(recentIds)})
      AND "totalfailedcount" > 0
    ORDER BY totalfailedcount DESC, username ASC
    LIMIT 100
`;

  // checked via the prisma query
  /* eslint-disable @typescript-eslint/no-non-null-assertion*/
  const result: UserList[] = raw.map((r) => ({
    userId: r.userId,
    username: r.username!,
    name: r.name!,
    email: r.email!,
    avatar: {
      animal: r.avatar_animal!,
      color: r.avatar_color!,
      background: r.avatar_bg!,
    },
    completedChallengeCount: r.completecount,
    failedChallengeCount: r.failedcount,
    vetoedChallengeCount: r.vetoedCount,
  }));
  /* eslint-enable @typescript-eslint/no-non-null-assertion*/

  return result;
}
