import { PrismaClient, User } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { ErrorCode } from "src/common/types";
import { AuthType } from "src/common/types/auth";
import { CustomError } from "src/common/utils/errors";

const prisma = new PrismaClient();

export async function createUser(data: {
  authType: AuthType;
  name: string;
  username: string;
  email: string;
}): Promise<Pick<User, "userId">> {
  const { authType, username, name, email } = data;

  try {
    const user = await prisma.user.create({
      data: {
        authType: authType,
        username: username,
        name: name,
        email: email,
      },
      select: {
        userId: true,
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
      throw new CustomError(ErrorCode.EXISTING_EMAIL, "Email already exists.");
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
