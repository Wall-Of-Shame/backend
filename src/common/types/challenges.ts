import { UserList } from "./users";

export interface ChallengeId {
  challengeId: string;
}

export type ChallengeType = "LAST_TO_COMPLETE" | "NOT_COMPLETED";

// Input schema for the `POST /challenges` route.
export interface ChallengePost {
  title: string;
  description?: string;
  endAt: string;
  type: ChallengeType;
  participants: string[];
}

// Return schema for the `GET /challenges/:challengeId` route.
export interface ChallengeData {
  challengeId: string;
  title: string;
  description?: string;
  startAt: string | null;
  endAt: string;
  participantCount: number;
  type: ChallengeType;
  owner: UserMini;
  participants: UserMini[];
}

// Internal types
type UserMini = Pick<UserList, "userId" | "username" | "name" | "avatar">;
