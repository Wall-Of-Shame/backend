export interface UserId {
  userId: string;
}

// Partial response schema for the `GET /users` route.
// Full response is Array<UserList>
export interface UserList {
  userId: string;
  name: string;
  username: string;
  completedChallengeCount: number;
  failedChallengeCount: number;
  vetoedChallengeCount: number;
  avatar: Avatar;
}

// Return schema for the `GET /self` route.
export interface UserData {
  userId: string;
  email: string;
  username?: string;
  name?: string;
  completedChallengeCount?: number;
  failedChallengeCount?: number;
  vetoedChallengeCount?: number;
  avatar: Partial<Avatar>;
  settings: {
    deadlineReminder: boolean;
    invitations: boolean;
  };
}

// Input schema for query strings in `GET users/?operation=<operation>` routes.
export interface UserListQuery {
  operation: "search" | "wallGlobal" | "wallRecents";
  query?: string; // has to be present if "search" is present
}

// Partial return schema for the `GET /self/friends` route.
// Full response is Array<UserFriends>
export interface UserFriends {
  userId: string;
  name: string;
  username: string;
  avatar: Avatar;
}

// Input schema for the `PATCH /self` route.
export interface UserPatch {
  name: string;
  username: string;
  avatar: Avatar;
  settings: {
    deadlineReminder?: boolean;
    invitations?: boolean;
  };
}

// Private interfaces
interface Avatar {
  animal: "CAT" | "DOG" | "RABBIT";
  color: "PRIMARY" | "SECONDARY" | "TERTIARY";
  background: string;
}
