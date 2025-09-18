/*
  Warnings:

  - Added the required column `supabasePath` to the `Application` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Application" ADD COLUMN     "supabasePath" JSONB NOT NULL;
