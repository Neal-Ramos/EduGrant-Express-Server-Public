/*
  Warnings:

  - Added the required column `applicationId` to the `Staff_Logs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scholarshipId` to the `Staff_Logs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Staff_Logs" ADD COLUMN     "applicationId" INTEGER NOT NULL,
ADD COLUMN     "scholarshipId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Staff_Logs" ADD CONSTRAINT "Staff_Logs_scholarshipId_fkey" FOREIGN KEY ("scholarshipId") REFERENCES "public"."Scholarship"("scholarshipId") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Staff_Logs" ADD CONSTRAINT "Staff_Logs_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "public"."Application"("applicationId") ON DELETE CASCADE ON UPDATE NO ACTION;
