import axios from "axios";
import admin from "firebase-admin";
import { OAuth2Client } from "google-auth-library";
import { sign } from "jsonwebtoken";

import { PostToken, AuthToken } from "../common/types";
import { AuthType } from "../common/types/auth";
import { findUser } from "./queries";

interface VerifiedToken {
  email: string;
}

async function authWithGoogle(token: string): Promise<VerifiedToken | null> {
  try {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      return null;
    }
    return {
      email: payload.email,
    };
  } catch (e) {
    throw new Error("Error while verifying token with Google");
  }
}

async function authWithFacebook(token: string): Promise<VerifiedToken | null> {
  try {
    const email: string = await axios
      .get<{ email: string }>("https://graph.facebook.com/me", {
        params: {
          fields: ["email"].join(","),
          access_token: token,
        },
      })
      .then((response) => response.data.email);

    if (!email) {
      return null;
    }

    return { email };
  } catch (e) {
    throw new Error("Error while verifying token with Facebook");
  }
}

async function authWithFirebase(token: string): Promise<VerifiedToken | null> {
  try {
    const firebaseEmail = await admin
      .auth()
      .verifyIdToken(token)
      .then((decodedToken) => {
        return decodedToken.email;
      });

    if (!firebaseEmail) {
      return null;
    }
    return { email: firebaseEmail };
  } catch (e) {
    throw new Error("Error while verifying token with Firebase");
  }
}

// Validates a token based on the authType with external providers.
export async function validateToken(
  authType: AuthType,
  token: string
): Promise<VerifiedToken | null> {
  switch (authType) {
    case AuthType.GOOGLE:
      return await authWithGoogle(token);
    case AuthType.FACEBOOK:
      return await authWithFacebook(token);
    case AuthType.FIREBASE:
      return await authWithFirebase(token);
    default:
      return null;
  }
}

// Retrieves the token for the user.
export async function getUserToken(
  verifiedToken: VerifiedToken
): Promise<AuthToken | null> {
  const { email } = verifiedToken;

  const user = await findUser({ email });
  if (!user) {
    return null;
  }

  const { userId } = user;
  return signToken(userId);
}

// Signs userId as a token.
export function signToken(userId: string): PostToken {
  if (!process.env.JWT_SECRET) {
    throw new Error("Environment was not configured properly.");
  }

  const token = sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
  return { token };
}
