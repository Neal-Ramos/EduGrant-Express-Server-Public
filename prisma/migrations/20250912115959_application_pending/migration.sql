/*
  Warnings:

  - Added the required column `pending` to the `Scholarship` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Scholarship" ADD COLUMN     "pending" INTEGER NOT NULL;
