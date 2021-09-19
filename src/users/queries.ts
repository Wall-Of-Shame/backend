import { PrismaClient, User } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";

import { ErrorCode, UserPatch } from "../common/types";
import { CustomError, getMeta } from "../common/utils/errors";

const prisma = new PrismaClient();

export async function createUser(data: {
  email: string;
  name?: string;
  username?: string;
}): Promise<User> {
  const { username, name, email } = data;

  try {
    const user = await prisma.user.create({
      data: {
        email,
        name,
        username,
      },
    });

    return user;
  } catch (e) {
    const error: PrismaClientKnownRequestError = e as any;
    const meta = getMeta(error);

    if (meta.target.includes("email")) {
      throw new CustomError(
        ErrorCode.EXISTING_ACCOUNT,
        "Account already exists."
      );
    } else if (meta.target.includes("username")) {
      throw new CustomError(
        ErrorCode.EXISTING_USERNAME,
        "Username already exists"
      );
    } else {
      throw new Error(ErrorCode.UNKNOWN_ERROR);
    }
  }
}

// Finds a single user. At least one of the inputs should be given.
export async function getUser(where: {
  userId?: string;
  username?: string;
  email?: string;
}): Promise<User | null> {
  const { userId, username, email } = where;
  if (!userId && !username && !email) {
    return null;
  }

  const user = await prisma.user.findFirst({
    where: {
      userId,
      username,
      email,
    },
  });

  return user;
}

export async function patchUser(
  userId: string,
  data: UserPatch
): Promise<void> {
  const { name, username, avatar } = data;
  const { animal, color, background } = avatar;

  try {
    await prisma.user.update({
      where: {
        userId,
      },
      data: {
        username: username,
        name: name,
        avatar_animal: animal,
        avatar_color: color,
        avatar_bg: background,
      },
      select: {
        userId: true,
      },
    });
    return;
  } catch (e) {
    const error: PrismaClientKnownRequestError = e as any;
    const meta = getMeta(error);

    if (meta.target.includes("username")) {
      throw new CustomError(
        ErrorCode.EXISTING_USERNAME,
        "Username already exists"
      );
    } else {
      console.log(error);
      throw new Error(ErrorCode.UNKNOWN_ERROR);
    }
  }
}
