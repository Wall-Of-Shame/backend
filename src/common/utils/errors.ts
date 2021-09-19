import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { Request, Response } from "express";

import { ErrorCode } from "../types";

export class CustomError extends Error {
  constructor(name: ErrorCode, message: string) {
    super(message);
    this.name = name;
  }
}

// Grabs the meta data from error object
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function getMeta(e: any): {
  target: string[];
} {
  const error: PrismaClientKnownRequestError = e;

  if (!error.meta) {
    // should not happen accd to docs
    return {
      target: [],
    };
  }

  const meta: { target: string[] } = error.meta as any;
  return meta;
}

// Handles unexpected errors.
export function handleServerError(
  _request: Request<any, any, any, any>,
  response: Response<any>
): void {
  response.status(500).send({
    error: {
      code: ErrorCode.UNKNOWN_ERROR,
      message: "Something unexpected happened.",
    },
  });
  return;
}

// Handles known errors
export function handleKnownError(
  _request: Request<any, any, any, any>,
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

// Handles unauthorised requests
export function handleUnauthRequest(response: Response): void {
  response.status(401).send({
    error: {
      code: ErrorCode.UNAUTHORIZED,
      message: "Unauthorised request.",
    },
  });
  return;
}

// Handles not found error
export function handleNotFoundError(response: Response, message: string): void {
  response.status(404).send({
    error: {
      code: ErrorCode.NOT_FOUND,
      message,
    },
  });
  return;
}
