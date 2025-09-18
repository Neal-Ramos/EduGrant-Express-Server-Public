/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Account` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."ISPSU_Head" DROP CONSTRAINT "ISPSU_Head_accountId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ISPSU_Staff" DROP CONSTRAINT "ISPSU_Staff_accountId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Student" DROP CONSTRAINT "Student_accountId_fkey";

-- AlterTable
ALTER TABLE "public"."Scholarship" ALTER COLUMN "amount" DROP NOT NULL,
ALTER COLUMN "form" DROP NOT NULL,
ALTER COLUMN "requiredGWA" DROP NOT NULL,
ALTER COLUMN "limit" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Account_email_key" ON "public"."Account"("email");

-- AddForeignKey
ALTER TABLE "public"."ISPSU_Head" ADD CONSTRAINT "ISPSU_Head_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "public"."Account"("accountId") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."ISPSU_Staff" ADD CONSTRAINT "ISPSU_Staff_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "public"."Account"("accountId") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Student" ADD CONSTRAINT "Student_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "public"."Account"("accountId") ON DELETE CASCADE ON UPDATE NO ACTION;
