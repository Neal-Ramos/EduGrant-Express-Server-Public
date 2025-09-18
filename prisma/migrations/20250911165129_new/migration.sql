-- AlterTable
ALTER TABLE "public"."Application" ALTER COLUMN "decisionId" DROP NOT NULL,
ALTER COLUMN "interviewId" DROP NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "public"."Student" ALTER COLUMN "familyBackground" DROP NOT NULL;
