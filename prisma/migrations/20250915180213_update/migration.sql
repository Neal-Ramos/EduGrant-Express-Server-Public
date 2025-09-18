-- DropForeignKey
ALTER TABLE "public"."Application" DROP CONSTRAINT "Application_decisionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Application" DROP CONSTRAINT "Application_interviewId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Application" DROP CONSTRAINT "Application_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Application" DROP CONSTRAINT "Application_scholarshipId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Application_Decision" DROP CONSTRAINT "Application_Decision_staffId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Interview_Decision" DROP CONSTRAINT "Interview_Decision_staffId_fkey";

-- AlterTable
ALTER TABLE "public"."Application_Decision" ALTER COLUMN "decisionId" DROP DEFAULT;
DROP SEQUENCE "Application_Decision_decisionId_seq";

-- AddForeignKey
ALTER TABLE "public"."Application" ADD CONSTRAINT "Application_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."Student"("studentId") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Application" ADD CONSTRAINT "Application_scholarshipId_fkey" FOREIGN KEY ("scholarshipId") REFERENCES "public"."Scholarship"("scholarshipId") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Application_Decision" ADD CONSTRAINT "Application_Decision_decisionId_fkey" FOREIGN KEY ("decisionId") REFERENCES "public"."Application"("applicationId") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Application_Decision" ADD CONSTRAINT "Application_Decision_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "public"."ISPSU_Staff"("staffId") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Interview_Decision" ADD CONSTRAINT "Interview_Decision_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "public"."Application"("applicationId") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Interview_Decision" ADD CONSTRAINT "Interview_Decision_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "public"."ISPSU_Staff"("staffId") ON DELETE SET NULL ON UPDATE NO ACTION;
