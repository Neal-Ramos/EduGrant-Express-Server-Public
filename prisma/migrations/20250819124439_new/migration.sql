/*
  Warnings:

  - You are about to drop the `security_code` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_accounts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_applications` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "user_applications" DROP CONSTRAINT "user_applications_adminId_fkey";

-- DropForeignKey
ALTER TABLE "user_applications" DROP CONSTRAINT "user_applications_scholarshipId_fkey";

-- DropForeignKey
ALTER TABLE "user_applications" DROP CONSTRAINT "user_applications_userId_fkey";

-- DropTable
DROP TABLE "security_code";

-- DropTable
DROP TABLE "user_accounts";

-- DropTable
DROP TABLE "user_applications";

-- CreateTable
CREATE TABLE "authentication_code" (
    "codeId" SERIAL NOT NULL,
    "origin" TEXT NOT NULL,
    "receiver" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "authentication_code_pkey" PRIMARY KEY ("codeId")
);

-- CreateTable
CREATE TABLE "student_accounts" (
    "userId" SERIAL NOT NULL,
    "contactNumber" TEXT NOT NULL,
    "userPassword" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "middleName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "address" TEXT NOT NULL,
    "course" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "studentEmail" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,

    CONSTRAINT "student_accounts_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "student_applications" (
    "applicationId" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "scholarshipId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "applicationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "applicationResponseDate" TIMESTAMP(3),
    "userDocuments" JSONB NOT NULL,
    "adminId" INTEGER,
    "rejectMessage" JSONB NOT NULL,

    CONSTRAINT "student_applications_pkey" PRIMARY KEY ("applicationId")
);

-- CreateIndex
CREATE UNIQUE INDEX "student_accounts_studentEmail_key" ON "student_accounts"("studentEmail");

-- CreateIndex
CREATE UNIQUE INDEX "student_accounts_studentId_key" ON "student_accounts"("studentId");

-- AddForeignKey
ALTER TABLE "student_applications" ADD CONSTRAINT "student_applications_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admin_accounts"("adminId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_applications" ADD CONSTRAINT "student_applications_scholarshipId_fkey" FOREIGN KEY ("scholarshipId") REFERENCES "scholarships"("scholarshipId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_applications" ADD CONSTRAINT "student_applications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "student_accounts"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
