/*
  Warnings:

  - The primary key for the `super_admin_account` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `superAdminId` on the `super_admin_account` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "super_admin_account" DROP CONSTRAINT "super_admin_account_pkey",
DROP COLUMN "superAdminId",
ADD COLUMN     "adminId" SERIAL NOT NULL,
ADD CONSTRAINT "super_admin_account_pkey" PRIMARY KEY ("adminId");
