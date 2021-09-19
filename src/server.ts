import { PrismaClient } from "@prisma/client";
import cors, { CorsOptions } from "cors";
import express from "express";
import admin from "firebase-admin";
import helmet from "helmet";
import { Server } from "http";
import morgan from "morgan";

import prisma from "./prisma";
import routes from "./routes";

const API_VERSION = "/api/v1";

const corsOptions: CorsOptions = {
  origin: "*",
};

function verifyEnvOrReject(): void {
  const { FIREBASE_DB_URL, GOOGLE_APPLICATION_CREDENTIALS, JWT_SECRET } =
    process.env;

  if (!FIREBASE_DB_URL || !GOOGLE_APPLICATION_CREDENTIALS || !JWT_SECRET) {
    throw new Error("Environment was not configured properly.");
  }
}
export class ApiServer {
  server: Server | undefined;
  prisma: PrismaClient | undefined;

  async initialize(port = 3001): Promise<void> {
    verifyEnvOrReject();

    this.prisma = prisma;

    const app = express();
    app.use(express.json({ limit: "20mb" }));
    app.use(express.urlencoded({ extended: true, limit: "20mb" }));
    app.use(cors(corsOptions));
    app.use(helmet());
    app.use(morgan("dev"));
    app.use(API_VERSION, routes);

    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      databaseURL: `https://${process.env.FIREBASE_DB_URL}.firebaseio.com`,
    });

    const message =
      `Server connected successfully on port: ${port}.\n` +
      `Current API version: ${API_VERSION}.`;

    this.server = app.listen(port, () => console.log(message));
    this.server.timeout = 1200000;
  }

  async close(): Promise<void> {
    this.server && this.server.close();
  }
}
