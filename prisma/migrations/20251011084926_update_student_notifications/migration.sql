/*
  Warnings:

  - Added the required column `applicationId` to the `Student_Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scholarshipId` to the `Student_Notification` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Student_Notification" DROP CONSTRAINT "Student_Notification_ownerId_fkey";

-- AlterTable
ALTER TABLE "public"."Student_Notification" ADD COLUMN     "applicationId" INTEGER NOT NULL,
ADD COLUMN     "scholarshipId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Student_Notification" ADD CONSTRAINT "Student_Notification_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "public"."Application"("applicationId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Student_Notification" ADD CONSTRAINT "Student_Notification_scholarshipId_fkey" FOREIGN KEY ("scholarshipId") REFERENCES "public"."Scholarship"("scholarshipId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Student_Notification" ADD CONSTRAINT "Student_Notification_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."Student"("studentId") ON DELETE CASCADE ON UPDATE NO ACTION;
