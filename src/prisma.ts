import { PrismaClient } from "@prisma/client";

let prisma = new PrismaClient();

// Shared prisma instance across backend.
export default prisma;
