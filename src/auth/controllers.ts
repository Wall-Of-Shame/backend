import { Request, Response } from "express";

import { ErrorCode, ErrRes, AuthToken, PostLogin } from "../common/types";
import { handleServerError } from "../common/utils/errors";
import { handleInvalidCredentialsError } from "./handlers";
import { getUserToken, validateToken } from "./services";

function handleNoExistingUser(_request: Request, response: Response): void {
  response.status(404).send({
    error: {
      code: ErrorCode.NON_EXISTENT_ACCOUNT,
      message: "Account does not exist",
    },
  });
  return;
}

export async function login(
  request: Request<any, any, PostLogin, any>,
  response: Response<AuthToken | ErrRes>
): Promise<void> {
  try {
    const { authType, token: reqToken } = request.body;
    const verifiedToken = await validateToken(authType, reqToken);

    if (!verifiedToken) {
      handleInvalidCredentialsError(request, response);
      return;
    }

    const token = await getUserToken(verifiedToken);

    if (!token) {
      handleNoExistingUser(request, response);
      return;
    }

    response.status(200).send(token);
    return;
  } catch (e) {
    console.log("Error: ", e);
    handleServerError(request, response);
    return;
  }
}
