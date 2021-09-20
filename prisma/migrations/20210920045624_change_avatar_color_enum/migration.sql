/*
  Warnings:

  - The values [BROWN] on the enum `AvatarColor` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AvatarColor_new" AS ENUM ('PRIMARY', 'SECONDARY', 'TERTIARY');
ALTER TABLE "User" ALTER COLUMN "avatar_color" TYPE "AvatarColor_new" USING ("avatar_color"::text::"AvatarColor_new");
ALTER TYPE "AvatarColor" RENAME TO "AvatarColor_old";
ALTER TYPE "AvatarColor_new" RENAME TO "AvatarColor";
DROP TYPE "AvatarColor_old";
COMMIT;
