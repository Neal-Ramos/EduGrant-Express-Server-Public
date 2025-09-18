/*
  Warnings:

  - Added the required column `interview` to the `scholarships` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "scholarships" ADD COLUMN     "interview" BOOLEAN NOT NULL;
