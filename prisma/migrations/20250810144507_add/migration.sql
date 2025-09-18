/*
  Warnings:

  - Added the required column `adminId` to the `scholarships` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "scholarships" ADD COLUMN     "adminId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "scholarships" ADD CONSTRAINT "scholarships_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admin_accounts"("adminId") ON DELETE RESTRICT ON UPDATE CASCADE;
