import { Request, Response } from "express";

import { ErrorCode } from "../common/types";

/**
 * Handles invalid credentials.
 *
 * @param request
 * @param response
 */
export function handleInvalidCredentialsError(
  _request: Request,
  response: Response
): void {
  response.status(401).send({
    error: {
      code: ErrorCode.INVALID_CREDENTIALS,
      message: "Invalid credentials given",
    },
  });
  return;
}
