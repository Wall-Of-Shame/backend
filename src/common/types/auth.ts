export const enum AuthType {
  GOOGLE = "GOOGLE",
  FACEBOOK = "FACEBOOK",
  FIREBASE = "FIREBASE",
}

export interface PostToken {
  token: string;
}

export interface AuthToken {
  token: string;
}

export interface PostLogin {
  authType: AuthType;
  token: string;
}
