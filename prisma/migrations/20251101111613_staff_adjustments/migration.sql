-- DropForeignKey
ALTER TABLE "public"."Staff_Logs" DROP CONSTRAINT "Staff_Logs_staffId_fkey";

-- AlterTable
ALTER TABLE "public"."Staff_Logs" ALTER COLUMN "staffId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Staff_Logs" ADD CONSTRAINT "Staff_Logs_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "public"."ISPSU_Staff"("staffId") ON DELETE SET NULL ON UPDATE NO ACTION;
