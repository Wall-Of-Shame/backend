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
