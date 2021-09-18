import { Request, Response } from "express";

import { handleInvalidCredentialsError } from "../auth/handlers";
import { signToken, validateToken } from "../auth/services";
import { AuthToken, ErrRes, ErrorCode } from "../common/types";
import { PostUser } from "../common/types/users";
import { handleServerError } from "../common/utils/errors";
import { createUser } from "./queries";

export async function create(
  request: Request<any, any, PostUser, any>,
  response: Response<AuthToken | ErrRes>
): Promise<void> {
  try {
    const { authType, token: reqToken, name, username } = request.body;
    const verifiedToken = await validateToken(authType, reqToken);

    if (!verifiedToken || !verifiedToken.email) {
      handleInvalidCredentialsError(request, response);
      return;
    }

    const user = await createUser({
      authType,
      username,
      name,
      email: verifiedToken.email,
    });

    const { userId } = user;
    const token = signToken(userId);
    response.status(200).send(token);
    return;
  } catch (e) {
    const error: Error = e as any;

    switch (error.name) {
      case ErrorCode.EXISTING_USERNAME:
      case ErrorCode.EXISTING_EMAIL:
        response.status(400).send({
          error: {
            code: error.name,
            message: error.message,
          },
        });
        return;
      default:
        handleServerError(request, response);
        return;
    }
  }
}
