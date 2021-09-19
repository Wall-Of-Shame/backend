import { UserData } from "./users";

// Input schema for the `POST /auth` route.
export interface AuthReq {
  token: string;
}

// Response schema for the `POST /auth` route.
export interface AuthRes {
  token: string;
  user: UserData;
}
