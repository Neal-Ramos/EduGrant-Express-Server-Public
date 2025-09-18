/*
  Warnings:

  - Added the required column `scholarshipDocumentsOptional` to the `scholarships` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scholarshipForm` to the `scholarships` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scholarshipType` to the `scholarships` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "scholarships" ADD COLUMN     "scholarshipDocumentsOptional" JSONB NOT NULL,
ADD COLUMN     "scholarshipForm" TEXT NOT NULL,
ADD COLUMN     "scholarshipType" TEXT NOT NULL,
ALTER COLUMN "scholarshipAmount" DROP NOT NULL;
