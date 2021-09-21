import { getParticipationStats } from "../challenges/utils";
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
            where: {
              // valid participant instance
              // user has accepted + challenge is over
              joined_at: { not: null },
              challenge: {
                endAt: { lte: new Date() },
              },
            },
            include: {
              challenge: {
                select: {
                  challengeId: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const recents: UserList[] = raw.map((contact) => {
    const { userId, username, name, avatar_animal, avatar_color, avatar_bg } =
      contact.pers2;
    const { completedChallengeCount, failedChallengeCount } =
      getParticipationStats(contact.pers2.participating_in);
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
        where: {
          // valid participant instance
          // user has accepted + challenge is over
          joined_at: { not: null },
          challenge: {
            endAt: { lte: new Date() },
          },
        },
        include: {
          challenge: {
            select: {
              challengeId: true,
            },
          },
        },
      },
    },
  });
  const result: UserList[] = raw.map((v) => {
    const { userId, username, name, avatar_animal, avatar_color, avatar_bg } =
      v;
    const { completedChallengeCount, failedChallengeCount } =
      getParticipationStats(v.participating_in);
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
    };
    /* eslint-enable @typescript-eslint/no-non-null-assertion*/
  });
  return result;
}

export async function getGlobalWall(): Promise<UserList[]> {
  return [];
}

export async function getUserWall(userId: string): Promise<UserList[]> {
  return [];
}
