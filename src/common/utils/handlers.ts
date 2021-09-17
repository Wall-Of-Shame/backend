import { Request, Response } from "express";
import { ErrorCode } from "../types";

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
