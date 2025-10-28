/*
  Warnings:

  - Made the column `indigenous` on table `Student` required. This step will fail if there are existing NULL values in that column.
  - Made the column `PWD` on table `Student` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."Student" ALTER COLUMN "indigenous" SET NOT NULL,
ALTER COLUMN "PWD" SET NOT NULL;
