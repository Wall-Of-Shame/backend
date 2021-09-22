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

export async function sendMessages(
  message: admin.messaging.MulticastMessage
): Promise<admin.messaging.BatchResponse> {
  return admin.messaging().sendMulticast(message);
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
  // safely assert env variable based on server.ts
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const token = sign({ userId }, process.env.JWT_SECRET!, { expiresIn: "7d" });
  return token;
}
