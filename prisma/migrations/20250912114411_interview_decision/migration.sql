/*
  Warnings:

  - You are about to drop the `Interview` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Application" DROP CONSTRAINT "Application_interviewId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Interview" DROP CONSTRAINT "Interview_staffId_fkey";

-- DropTable
DROP TABLE "public"."Interview";

-- CreateTable
CREATE TABLE "public"."Interview_Decision" (
    "interviewId" SERIAL NOT NULL,
    "staffId" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Interview_Decision_pkey" PRIMARY KEY ("interviewId")
);

-- AddForeignKey
ALTER TABLE "public"."Application" ADD CONSTRAINT "Application_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "public"."Interview_Decision"("interviewId") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Interview_Decision" ADD CONSTRAINT "Interview_Decision_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "public"."ISPSU_Staff"("staffId") ON DELETE NO ACTION ON UPDATE NO ACTION;
