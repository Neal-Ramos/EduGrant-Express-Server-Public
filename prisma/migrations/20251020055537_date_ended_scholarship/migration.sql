/*
  Warnings:

  - You are about to drop the column `validated` on the `ISPSU_Head` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."ISPSU_Head" DROP COLUMN "validated";

-- AlterTable
ALTER TABLE "public"."ISPSU_Staff" ADD COLUMN     "validated" BOOLEAN NOT NULL DEFAULT false;
