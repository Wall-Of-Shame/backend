import { AuthType } from "./auth";

export interface PostUser {
  authType: AuthType;
  token: string;
  name: string;
  username: string;
}
