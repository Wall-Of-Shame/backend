import { ErrorCode } from "../types";

export class CustomError extends Error {
  constructor(name: ErrorCode, message: string) {
    super(message);
    this.name = name;
  }
}
