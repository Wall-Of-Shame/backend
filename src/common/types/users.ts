import { PostLogin } from "./";

export interface PostUser extends PostLogin {
  name: string;
  username: string;
}
