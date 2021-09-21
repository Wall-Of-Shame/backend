import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";
import cors, { CorsOptions } from "cors";
import express from "express";
import admin from "firebase-admin";
import helmet from "helmet";
import { Server } from "http";
import morgan from "morgan";
import { Multer } from "multer";

import uploader from "./cloudinary";
import prisma from "./prisma";
import routes from "./routes";

const API_VERSION = "/api/v1";

const corsOptions: CorsOptions = {
  origin: "*",
};

function verifyEnvOrReject(): void {
  const {
    JWT_SECRET,
    CLOUDINARY_NAME,
    CLOUDINARY_KEY,
    CLOUDINARY_SECRET,
    FIREBASE_PROJECT_ID,
    FIREBASE_CLIENT_EMAIL,
    FIREBASE_PRIVATE_KEY,
  } = process.env;

  if (
    !JWT_SECRET ||
    !CLOUDINARY_NAME ||
    !CLOUDINARY_KEY ||
    !CLOUDINARY_SECRET ||
    !FIREBASE_PROJECT_ID ||
    !FIREBASE_CLIENT_EMAIL ||
    !FIREBASE_PRIVATE_KEY
  ) {
    throw new Error("Environment was not configured properly.");
  }
}
export class ApiServer {
  server: Server | undefined;
  prisma: PrismaClient | undefined;
  uploader: Multer | undefined;

  async initialize(port = 3001): Promise<void> {
    verifyEnvOrReject();

    this.prisma = prisma;

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_NAME,
      api_key: process.env.CLOUDINARY_KEY,
      api_secret: process.env.CLOUDINARY_SECRET,
    });
    this.uploader = uploader;

    const app = express();
    app.use(express.json({ limit: "20mb" }));
    app.use(express.urlencoded({ extended: true, limit: "20mb" }));
    app.use(cors(corsOptions));
    app.use(helmet());
    app.use(morgan("dev"));
    app.use(API_VERSION, routes);

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY,
      }),
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
