/*
  Warnings:

  - You are about to drop the column `renew` on the `student_accounts` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "scholarships" ADD COLUMN     "renew" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "student_accounts" DROP COLUMN "renew";
