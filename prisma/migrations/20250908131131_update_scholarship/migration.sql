/*
  Warnings:

  - You are about to drop the `admin_accounts` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "announcements" DROP CONSTRAINT "announcements_adminId_fkey";

-- DropForeignKey
ALTER TABLE "scholarships" DROP CONSTRAINT "scholarships_adminId_fkey";

-- DropForeignKey
ALTER TABLE "student_applications" DROP CONSTRAINT "student_applications_adminId_fkey";

-- AlterTable
ALTER TABLE "scholarships" ALTER COLUMN "scholarshipForm" DROP NOT NULL;

-- DropTable
DROP TABLE "admin_accounts";

-- CreateTable
CREATE TABLE "staff_accounts" (
    "adminId" SERIAL NOT NULL,
    "dateCreate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT NOT NULL,
    "lastLogin" TIMESTAMP(3),
    "passwordHash" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "profileImage" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "middleName" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'ADMIN',
    "supabasePath" TEXT NOT NULL,
    "validated" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "staff_accounts_pkey" PRIMARY KEY ("adminId")
);

-- CreateIndex
CREATE UNIQUE INDEX "staff_accounts_email_key" ON "staff_accounts"("email");

-- AddForeignKey
ALTER TABLE "scholarships" ADD CONSTRAINT "scholarships_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "staff_accounts"("adminId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_applications" ADD CONSTRAINT "student_applications_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "staff_accounts"("adminId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "staff_accounts"("adminId") ON DELETE SET NULL ON UPDATE CASCADE;
