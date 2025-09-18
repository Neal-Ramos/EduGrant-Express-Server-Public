-- DropForeignKey
ALTER TABLE "public"."Scholarship" DROP CONSTRAINT "Scholarship_ISPSUId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Scholarship" DROP CONSTRAINT "Scholarship_SPId_fkey";

-- AddForeignKey
ALTER TABLE "public"."Scholarship" ADD CONSTRAINT "Scholarship_ISPSUId_fkey" FOREIGN KEY ("ISPSUId") REFERENCES "public"."ISPSU_Head"("headId") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Scholarship" ADD CONSTRAINT "Scholarship_SPId_fkey" FOREIGN KEY ("SPId") REFERENCES "public"."Scholarship_Provider"("SPId") ON DELETE SET NULL ON UPDATE NO ACTION;
