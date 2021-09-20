// concept of challenge end date
// => create: make sure end date is > current
// => patch: same^
// => index: ongoing (> current + started/joined_at) || pending (> current + X joined_at) || history (<= current)
// => show: hmm maybe no need
// => accept: X ended. Allow for after start, then joined.
// => reject: need. Should it be after it started, then no rejecting? or after it has ended, no reject
// => complete: has to be running
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
