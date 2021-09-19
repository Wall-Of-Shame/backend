import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Shared prisma instance across backend.
export default prisma;
