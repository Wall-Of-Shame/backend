import admin from "firebase-admin";
import { sign } from "jsonwebtoken";

import { AuthToken } from "../common/types";
import { findUser } from "./queries";

interface VerifiedToken {
  email: string;
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

// Validates a token with Firebase.
export async function validateToken(
  token: string
): Promise<VerifiedToken | null> {
  return await authWithFirebase(token);
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
export function signToken(userId: string): AuthToken {
  if (!process.env.JWT_SECRET) {
    throw new Error("Environment was not configured properly.");
  }

  const token = sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
  return { token };
}
