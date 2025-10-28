/*
  Warnings:

  - Made the column `scholarshipId` on table `Application` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."Application" ALTER COLUMN "scholarshipId" SET NOT NULL;
