import { Request, Response } from "express";

import { Payload } from "../common/middlewares/checkToken";
import { UserPatch } from "../common/types";
import { handleServerError } from "../common/utils/errors";
import { patchUser } from "./queries";

export async function update(
  request: Request<any, any, UserPatch, any>,
  response: Response<Record<string, never>, Payload>
): Promise<void> {
  try {
    console.log("payload", response.locals.payload);
    const { userId } = response.locals.payload;

    await patchUser(userId, request.body);
    response.status(204).send({});
    // TODO: add 404
    return;
  } catch (e) {
    console.log(e);
    handleServerError(request, response);
    return;
  }
}
