// Input schema for `POST /challenges/:challengeId/votes`
export interface VotePost {
  victimId: string;
}

// Output schema for `GET /challenges/:challengeId/votes`
export type VoteList = VoteData[];

// Internal types - used to construct the rest
export interface VoteData {
  victim: {
    userId: string;
    username: string;
    name: string;
    evidenceLink?: string;
  };
  accusers: string[];
}
