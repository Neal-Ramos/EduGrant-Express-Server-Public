/*
  Warnings:

  - Made the column `familyBackground` on table `student_accounts` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "student_accounts" ALTER COLUMN "familyBackground" SET NOT NULL,
ALTER COLUMN "familyBackground" SET DEFAULT '{}';
