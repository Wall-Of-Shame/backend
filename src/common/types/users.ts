export interface UserId {
  userId: string;
}

// Response schema for the `GET /users` route.
export interface UserList {
  userId: string;
  name: string;
  username: string;
  completedChallengeCount: number;
  failedChallengeCount: number;
}

// Return schema for the `GET /users/:userId` route.
export interface User {
  userId: string;
  email: string;
  username?: string;
  name?: string;
  completedChallengeCount?: number;
  failedChallengeCount?: number;
  settings: {
    deadlineReminder: boolean;
    invitations: boolean;
  };
}

// Return schema for the `GET /users/:userId/friends` route.
export interface UserFriends {
  userId: string;
  name: string;
  username: string;
  befriendedAt: string;
}

// Input schema for the `PATCH /users` route.
export interface UserPatch {
  name: string;
  username: string;
  avatar: {
    animal?: "CAT" | "DOG" | "RABBIT";
    color?: string;
    background?: string;
  };
}
