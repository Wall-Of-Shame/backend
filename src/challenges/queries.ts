import { Challenge, Prisma } from "@prisma/client";

import { ErrorCode } from "../common/types";
import prisma from "../prisma";

// Creates a challenge
export async function createChallenge(
  args: Prisma.ChallengeCreateArgs
): Promise<Challenge> {
  try {
    const challenge = await prisma.challenge.create(args);
    return challenge;
  } catch (e) {
    throw new Error(ErrorCode.UNKNOWN_ERROR);
  }
}

export async function getChallenge(
  args: Prisma.ChallengeFindFirstArgs
): Promise<Challenge | null> {
  try {
    const challenge = await prisma.challenge.findFirst(args);
    return challenge;
  } catch (e) {
    throw new Error(ErrorCode.UNKNOWN_ERROR);
  }
}
