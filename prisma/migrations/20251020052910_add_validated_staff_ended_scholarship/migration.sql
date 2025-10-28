/*
  Warnings:

  - You are about to drop the column `archived` on the `Scholarship` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."ISPSU_Head" ADD COLUMN     "validated" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."Scholarship" DROP COLUMN "archived",
ADD COLUMN     "ended" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "interview" SET DEFAULT false;
