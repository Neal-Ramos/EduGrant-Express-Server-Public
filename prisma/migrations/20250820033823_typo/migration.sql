/*
  Warnings:

  - You are about to drop the column `scholarshipDealine` on the `scholarships` table. All the data in the column will be lost.
  - Added the required column `scholarshipDeadline` to the `scholarships` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "scholarships" DROP COLUMN "scholarshipDealine",
ADD COLUMN     "scholarshipDeadline" TIMESTAMP(3) NOT NULL;
