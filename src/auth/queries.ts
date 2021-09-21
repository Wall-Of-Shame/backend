import { User } from "@prisma/client";

import prisma from "../prisma";

export async function findUser(where: {
  email?: string;
}): Promise<Pick<User, "userId"> | null> {
  const { email } = where;

  const user = await prisma.user.findFirst({
    where: {
      email: email,
    },
    select: {
      userId: true,
    },
  });

  return user;
}
