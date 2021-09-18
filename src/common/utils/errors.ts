import { Request, Response } from "express";

import { ErrorCode } from "../types";

export class CustomError extends Error {
  constructor(name: ErrorCode, message: string) {
    super(message);
    this.name = name;
  }
}
/**
 * Handles unexpected errors.
 *
 * @param request
 * @param response
 */
export function handleServerError(_request: Request, response: Response): void {
  response.status(500).send({
    error: {
      code: ErrorCode.UNKNOWN_ERROR,
      message: "Something unexpected happened.",
    },
  });
  return;
}

export function handleKnownError(
  _request: Request,
  response: Response,
  error: CustomError
): void {
  response.status(400).send({
    error: {
      code: error.name,
      message: error.message,
    },
  });
  return;
}
