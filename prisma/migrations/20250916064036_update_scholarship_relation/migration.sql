-- AlterTable
ALTER TABLE "public"."Application" ALTER COLUMN "scholarshipId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."Application_Decision" ALTER COLUMN "staffId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."Interview_Decision" ALTER COLUMN "staffId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."Scholarship" ALTER COLUMN "ISPSUId" DROP NOT NULL,
ALTER COLUMN "SPId" DROP NOT NULL;
