/*
  Warnings:

  - The `form` column on the `Scholarship` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `cover` on the `Scholarship` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `logo` on the `Scholarship` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "public"."Scholarship" DROP COLUMN "cover",
ADD COLUMN     "cover" JSONB NOT NULL,
DROP COLUMN "logo",
ADD COLUMN     "logo" JSONB NOT NULL,
DROP COLUMN "form",
ADD COLUMN     "form" JSONB;
