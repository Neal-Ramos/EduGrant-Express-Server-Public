/*
  Warnings:

  - You are about to drop the column `SPId` on the `Scholarship` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Scholarship" DROP CONSTRAINT "Scholarship_SPId_fkey";

-- AlterTable
ALTER TABLE "public"."Scholarship" DROP COLUMN "SPId";

-- AlterTable
ALTER TABLE "public"."Scholarship_Provider" ALTER COLUMN "SPId" DROP DEFAULT;
DROP SEQUENCE "Scholarship_Provider_SPId_seq";

-- AddForeignKey
ALTER TABLE "public"."Scholarship_Provider" ADD CONSTRAINT "Scholarship_Provider_SPId_fkey" FOREIGN KEY ("SPId") REFERENCES "public"."Scholarship"("scholarshipId") ON DELETE CASCADE ON UPDATE NO ACTION;
