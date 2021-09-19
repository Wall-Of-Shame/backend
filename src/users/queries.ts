import { PrismaClient, User } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";

import { ErrorCode } from "../common/types";
import { CustomError } from "../common/utils/errors";

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

    if (!error.meta) {
      // should not happen accd to docs
      throw new Error(ErrorCode.UNKNOWN_ERROR);
    }

    const meta: { target: string[] } = error.meta as any;

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
