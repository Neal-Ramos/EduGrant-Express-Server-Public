/*
  Warnings:

  - Added the required column `institute` to the `student_accounts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "student_accounts" ADD COLUMN     "institute" TEXT NOT NULL;
