import { PrismaClient, User } from "@prisma/client";

const prisma = new PrismaClient();

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
