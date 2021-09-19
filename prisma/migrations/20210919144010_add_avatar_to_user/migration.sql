-- CreateEnum
CREATE TYPE "AvatarAnimal" AS ENUM ('CAT', 'DOG', 'RABBIT');

-- CreateEnum
CREATE TYPE "AvatarColor" AS ENUM ('BROWN');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatar_animal" "AvatarAnimal",
ADD COLUMN     "avatar_bg" TEXT,
ADD COLUMN     "avatar_color" "AvatarColor";
