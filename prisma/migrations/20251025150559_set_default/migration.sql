-- AlterTable
ALTER TABLE "public"."Student" ALTER COLUMN "indigenous" SET DEFAULT '',
ALTER COLUMN "PWD" SET DEFAULT '';

-- AlterTable
ALTER TABLE "public"."Student_Notification" ALTER COLUMN "status" DROP DEFAULT;
