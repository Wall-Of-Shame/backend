// concept of challenge end date
// => create: make sure end date is > current
// => patch: same^
// => index: ongoing (> current + started/joined_at) || pending (> current + X joined_at) || history (<= current)
// => show: hmm maybe no need
// => accept: X ended
import { isAfter, isBefore } from "date-fns";

// checks if the challenge is over
export function isChallengeOver(end: Date): boolean {
  return isBefore(new Date(), end);
}

// checks if
export function startBeforeEnd(start: Date, end: Date): boolean {
  return isBefore(start, end);
}
