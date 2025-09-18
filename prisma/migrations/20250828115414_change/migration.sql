/*
  Warnings:

  - You are about to drop the column `cloudinaryId` on the `admin_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `scholarshipCloudinaryId` on the `scholarships` table. All the data in the column will be lost.
  - Added the required column `supabasePath` to the `admin_accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scholarshipSupabasePath` to the `scholarships` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "admin_accounts" DROP COLUMN "cloudinaryId",
ADD COLUMN     "supabasePath" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "scholarships" DROP COLUMN "scholarshipCloudinaryId",
ADD COLUMN     "scholarshipSupabasePath" JSONB NOT NULL;
