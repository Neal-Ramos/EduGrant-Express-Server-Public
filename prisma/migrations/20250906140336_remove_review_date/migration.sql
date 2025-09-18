/*
  Warnings:

  - You are about to drop the column `applicationReviewedDate` on the `student_applications` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "student_applications" DROP COLUMN "applicationReviewedDate",
ADD COLUMN     "applicationSetInterviewDate" TIMESTAMP(3);
