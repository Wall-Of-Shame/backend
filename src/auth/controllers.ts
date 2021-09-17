import { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import { ErrRes, PostLogin, PostToken, ResponseToken } from "../common/types";
import { handleServerError } from "../common/utils/handlers";
import { handleInvalidCredentials } from "./handlers";

export async function loginFacebook(
  request: Request<{}, {}, PostToken, {}>,
  response: Response<ResponseToken | ErrRes, {}>
): Promise<void> {
  try {
  } catch {
    handleServerError(request, response);
    return;
  }
}

export async function loginGoogle(
  request: Request<{}, {}, PostToken, {}>,
  response: Response<ResponseToken | ErrRes, {}>
): Promise<void> {
  try {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const { token } = request.body;

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload) {
      handleInvalidCredentials(request, response);
      return;
    }

    const { name, email } = payload;
    response.status(200).send({
      token: "123token123",
    });
    return;
  } catch {
    handleServerError(request, response);
    return;
  }
}

export async function login(
  request: Request<{}, {}, PostLogin, {}>,
  response: Response<ResponseToken | ErrRes, {}>
): Promise<void> {
  try {
  } catch {
    handleServerError(request, response);
    return;
  }
}
