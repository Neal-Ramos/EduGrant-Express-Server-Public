/*
  Warnings:

  - Added the required column `adminId` to the `announcements` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "announcements" ADD COLUMN     "adminId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admin_accounts"("adminId") ON DELETE RESTRICT ON UPDATE CASCADE;
