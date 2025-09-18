-- AlterTable
ALTER TABLE "public"."ISPSU_Head" ALTER COLUMN "mName" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."ISPSU_Staff" ALTER COLUMN "mName" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."Student" ALTER COLUMN "mName" DROP NOT NULL;
