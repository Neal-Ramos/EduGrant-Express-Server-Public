-- DropForeignKey
ALTER TABLE "public"."Interview_Decision" DROP CONSTRAINT "Interview_Decision_interviewId_fkey";

-- AddForeignKey
ALTER TABLE "public"."Interview_Decision" ADD CONSTRAINT "Interview_Decision_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "public"."Application"("applicationId") ON DELETE CASCADE ON UPDATE NO ACTION;
