/*
  Warnings:

  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - Added the required column `authType` to the `User` table without a default value. This is not possible if the table is not empty.
  - Made the column `email` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "AuthType" AS ENUM ('GOOGLE', 'FACEBOOK', 'FIREBASE');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "password",
ADD COLUMN     "authType" "AuthType" NOT NULL,
ALTER COLUMN "email" SET NOT NULL;
