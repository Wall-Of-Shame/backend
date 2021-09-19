import { Challenge, Prisma } from "@prisma/client";

import { ErrorCode } from "../common/types";
import prisma from "../prisma";

// Counts the completedChallengeCount and failedChallengeCount for given user.
export async function challengeCount(userId: string): Promise<{
  failedChallengeCount: number;
  completedChallengeCount: number;
}> {
  return {
    failedChallengeCount: 0,
    completedChallengeCount: 0,
  };
}

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
