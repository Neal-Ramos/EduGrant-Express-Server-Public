/*
  Warnings:

  - You are about to drop the column `adminEmail` on the `admin_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `adminName` on the `admin_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `adminPassword` on the `admin_accounts` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `admin_accounts` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `cloudinaryId` to the `admin_accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dateCreate` to the `admin_accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `admin_accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fullName` to the `admin_accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastLogin` to the `admin_accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `passwordHash` to the `admin_accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `admin_accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profileImage` to the `admin_accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `admin_accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `admin_accounts` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "admin_accounts_adminEmail_key";

-- AlterTable
ALTER TABLE "admin_accounts" DROP COLUMN "adminEmail",
DROP COLUMN "adminName",
DROP COLUMN "adminPassword",
ADD COLUMN     "cloudinaryId" TEXT NOT NULL,
ADD COLUMN     "dateCreate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "fullName" TEXT NOT NULL,
ADD COLUMN     "lastLogin" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "passwordHash" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT NOT NULL,
ADD COLUMN     "profileImage" TEXT NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL,
ADD COLUMN     "username" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "admin_accounts_email_key" ON "admin_accounts"("email");
