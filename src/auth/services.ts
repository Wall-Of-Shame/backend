import { User } from "@prisma/client";
import admin from "firebase-admin";
import { sign } from "jsonwebtoken";

import { ErrorCode } from "../common/types";
import { CustomError } from "../common/utils/errors";

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
    throw new CustomError(
      ErrorCode.INVALID_CREDENTIALS,
      "Invalid credentials given"
    );
  }
}

// Validates a token with Firebase.
export async function validateToken(
  token: string
): Promise<VerifiedToken | null> {
  return await authWithFirebase(token);
}

// Retrieves the token for the user.
export function getUserToken(user: User): string {
  const { userId } = user;
  return signToken(userId);
}

// Signs userId as a token.
export function signToken(userId: string): string {
  if (!process.env.JWT_SECRET) {
    throw new Error("Environment was not configured properly.");
  }

  const token = sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
  return token;
}
