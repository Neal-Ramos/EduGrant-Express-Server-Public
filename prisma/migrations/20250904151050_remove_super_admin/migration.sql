/*
  Warnings:

  - You are about to drop the `super_admin_account` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "admin_accounts" ADD COLUMN     "validated" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "super_admin_account";
