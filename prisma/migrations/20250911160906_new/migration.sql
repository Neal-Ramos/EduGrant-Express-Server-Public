-- AddForeignKey
ALTER TABLE "public"."Announcement" ADD CONSTRAINT "Announcement_headId_fkey" FOREIGN KEY ("headId") REFERENCES "public"."ISPSU_Head"("headId") ON DELETE NO ACTION ON UPDATE NO ACTION;
