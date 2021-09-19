export interface ErrRes {
  error: {
    code: ErrorCode;
    message: string;
  };
}

export enum ErrorCode {
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  EXISTING_USERNAME = "EXISTING_USERNAME",
  EXISTING_ACCOUNT = "EXISTING_ACCOUNT",
  NON_EXISTENT_ACCOUNT = "NON_EXISTENT_ACCOUNT",
}
