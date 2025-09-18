/*
  Warnings:

  - Changed the type of `rejectMessage` on the `user_applications` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "user_applications" DROP COLUMN "rejectMessage",
ADD COLUMN     "rejectMessage" JSONB NOT NULL;
