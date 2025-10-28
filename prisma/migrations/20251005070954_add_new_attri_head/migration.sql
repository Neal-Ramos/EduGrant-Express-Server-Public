-- AlterTable
ALTER TABLE "public"."ISPSU_Head" ADD COLUMN     "addres" TEXT,
ADD COLUMN     "gender" TEXT;

-- AlterTable
ALTER TABLE "public"."Interview_Decision" ALTER COLUMN "interviewId" DROP DEFAULT;
DROP SEQUENCE "Interview_Decision_interviewId_seq";
