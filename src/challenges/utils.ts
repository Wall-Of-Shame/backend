// concept of challenge end date
// => create: make sure end date is > current
// => patch: same^, cannot edit when challenge has started
// => index: ongoing (> current + started/joined_at) || pending (> current + X joined_at) || history (<= current)
// => show: hmm maybe no need
// => accept: X ended. Allow for after start, then joined.
// => reject: need. Should it be after it started, then no rejecting? or after it has ended, no reject
// => complete: has to be running
import { Participant } from "@prisma/client";
import { isBefore } from "date-fns";

// checks if the challenge is over
export function isChallengeOver(end: Date): boolean {
  return !isBefore(new Date(), end);
}

// checks if challenge start is before its end
export function isStartBeforeEnd(start: Date | null, end: Date): boolean {
  if (!start) {
    return true;
  }
  return isBefore(start, end);
}

// checks if the challenge is currently running ie start <= current <= end
export function isChallengeRunning(start: Date | null, end: Date): boolean {
  if (!start) {
    // challenge has not started
    return false;
  }
  const now = new Date();
  return isBefore(start, now) && isBefore(now, end);
}

export function hasUserAccepted(joinedDate: Date | null): boolean {
  return joinedDate !== null;
}

export function hasChallengeStarted(start: Date | null): boolean {
  if (!start) {
    return false;
  }
  return isBefore(start, new Date());
}

// In: list of valid participation instances
// Out: Count
export function getParticipationStats(participantInstances: Participant[]): {
  completedChallengeCount: number;
  failedChallengeCount: number;
  vetoedChallengeCount: number;
} {
  let completedChallengeCount = 0;
  let failedChallengeCount = 0;
  let vetoedChallengeCount = 0;

  for (const p of participantInstances) {
    if (p.completed_at) {
      if (p.has_been_vetoed) {
        vetoedChallengeCount++;
      } else {
        completedChallengeCount++;
      }
    } else {
      failedChallengeCount++;
    }
  }

  return {
    completedChallengeCount,
    failedChallengeCount,
    vetoedChallengeCount,
  };
}

// valid participant instance for counting results
// user has accepted + challenge is over
export const validParticipationFilter = {
  joined_at: { not: null },
  challenge: {
    endAt: { lte: new Date() },
  },
};
