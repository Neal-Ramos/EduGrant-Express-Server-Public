/*
  Warnings:

  - Added the required column `applicationId` to the `Application_Decision` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scholarshipPhase` to the `Application_Decision` table without a default value. This is not possible if the table is not empty.
  - Added the required column `applicationId` to the `Interview_Decision` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scholarshipPhase` to the `Interview_Decision` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Application_Decision" DROP CONSTRAINT "Application_Decision_decisionId_fkey";

-- AlterTable
CREATE SEQUENCE "public".application_decision_decisionid_seq;
ALTER TABLE "public"."Application_Decision" ADD COLUMN     "applicationId" INTEGER NOT NULL,
ADD COLUMN     "scholarshipPhase" INTEGER NOT NULL,
ALTER COLUMN "decisionId" SET DEFAULT nextval('"public".application_decision_decisionid_seq');
ALTER SEQUENCE "public".application_decision_decisionid_seq OWNED BY "public"."Application_Decision"."decisionId";

-- AlterTable
CREATE SEQUENCE "public".interview_decision_interviewid_seq;
ALTER TABLE "public"."Interview_Decision" ADD COLUMN     "applicationId" INTEGER NOT NULL,
ADD COLUMN     "scholarshipPhase" INTEGER NOT NULL,
ALTER COLUMN "interviewId" SET DEFAULT nextval('"public".interview_decision_interviewid_seq');
ALTER SEQUENCE "public".interview_decision_interviewid_seq OWNED BY "public"."Interview_Decision"."interviewId";

-- AddForeignKey
ALTER TABLE "public"."Application_Decision" ADD CONSTRAINT "Application_Decision_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "public"."Application"("applicationId") ON DELETE CASCADE ON UPDATE NO ACTION;
