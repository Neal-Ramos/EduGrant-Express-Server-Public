/*
  Warnings:

  - Added the required column `supabasePath` to the `Scholarship` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Scholarship" ADD COLUMN     "supabasePath" JSONB NOT NULL,
ALTER COLUMN "cover" SET DATA TYPE TEXT,
ALTER COLUMN "logo" SET DATA TYPE TEXT,
ALTER COLUMN "form" SET DATA TYPE TEXT;
