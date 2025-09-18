/*
  Warnings:

  - Added the required column `indiginous` to the `student_accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pwd` to the `student_accounts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "student_accounts" ADD COLUMN     "indiginous" BOOLEAN NOT NULL,
ADD COLUMN     "pwd" BOOLEAN NOT NULL;
