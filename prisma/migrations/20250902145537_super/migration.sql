/*
  Warnings:

  - You are about to drop the `superAdminAccount` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "superAdminAccount";

-- CreateTable
CREATE TABLE "super_admin_account" (
    "superAdminId" SERIAL NOT NULL,
    "dateCreate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT NOT NULL,
    "lastLogin" TIMESTAMP(3),
    "passwordHash" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "profileImage" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "middleName" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "supabasePath" TEXT NOT NULL,

    CONSTRAINT "super_admin_account_pkey" PRIMARY KEY ("superAdminId")
);

-- CreateIndex
CREATE UNIQUE INDEX "super_admin_account_email_key" ON "super_admin_account"("email");
