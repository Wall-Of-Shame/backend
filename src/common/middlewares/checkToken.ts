import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

import { handleUnauthRequest } from "../utils/errors";

// interface for payload.
// See /auth/services as well.
export type Payload = {
  payload: {
    iat: number;
    exp: number;
    userId: string;
  };
};

function isValidPayload(payload: any): boolean {
  // allow for ?. here to verify payload
  const hasTokenLifespan =
    typeof payload?.iat === "number" && typeof payload?.exp === "number";
  const isAccessToken = typeof payload?.userId === "string";
  return isAccessToken && hasTokenLifespan;
}

// checks for valid token and adds payload into response.locals
export function checkValidToken(
  request: Request,
  response: Response,
  next: NextFunction
): void {
  const bearerToken: string | undefined = request.headers.authorization;
  if (!bearerToken) {
    handleUnauthRequest(response);
    return;
  }

  const token = bearerToken.split(" ")[1];
  let payload: JwtPayload | string;
  try {
    // safely assert env variable based on server.ts
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    payload = jwt.verify(token, process.env.JWT_SECRET!);
  } catch (error) {
    handleUnauthRequest(response);
    return;
  }

  if (!isValidPayload(payload)) {
    handleUnauthRequest(response);
    return;
  }

  response.locals.payload = payload;
  next();
}
