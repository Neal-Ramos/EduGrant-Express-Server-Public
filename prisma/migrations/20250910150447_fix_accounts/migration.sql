/*
  Warnings:

  - You are about to drop the `announcements` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `authentication_code` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `notifications` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `scholarships` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `scholarships_archive` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `staffLogs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `staff_accounts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `student_accounts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `student_applications` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."announcements" DROP CONSTRAINT "announcements_adminId_fkey";

-- DropForeignKey
ALTER TABLE "public"."notifications" DROP CONSTRAINT "notifications_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."scholarships" DROP CONSTRAINT "scholarships_adminId_fkey";

-- DropForeignKey
ALTER TABLE "public"."scholarships_archive" DROP CONSTRAINT "scholarships_archive_scholarshipId_fkey";

-- DropForeignKey
ALTER TABLE "public"."staffLogs" DROP CONSTRAINT "staffLogs_announcementId_fkey";

-- DropForeignKey
ALTER TABLE "public"."staffLogs" DROP CONSTRAINT "staffLogs_applicationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."staffLogs" DROP CONSTRAINT "staffLogs_scholarshipId_fkey";

-- DropForeignKey
ALTER TABLE "public"."student_applications" DROP CONSTRAINT "student_applications_adminId_fkey";

-- DropForeignKey
ALTER TABLE "public"."student_applications" DROP CONSTRAINT "student_applications_scholarshipId_fkey";

-- DropForeignKey
ALTER TABLE "public"."student_applications" DROP CONSTRAINT "student_applications_userId_fkey";

-- DropTable
DROP TABLE "public"."announcements";

-- DropTable
DROP TABLE "public"."authentication_code";

-- DropTable
DROP TABLE "public"."notifications";

-- DropTable
DROP TABLE "public"."scholarships";

-- DropTable
DROP TABLE "public"."scholarships_archive";

-- DropTable
DROP TABLE "public"."staffLogs";

-- DropTable
DROP TABLE "public"."staff_accounts";

-- DropTable
DROP TABLE "public"."student_accounts";

-- DropTable
DROP TABLE "public"."student_applications";

-- CreateTable
CREATE TABLE "public"."Account" (
    "accountId" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "hashedPassword" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("accountId")
);

-- CreateTable
CREATE TABLE "public"."ISPSU_Head" (
    "headId" SERIAL NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fName" TEXT NOT NULL,
    "lName" TEXT NOT NULL,
    "mName" TEXT NOT NULL,
    "accountId" INTEGER NOT NULL,

    CONSTRAINT "ISPSU_Head_pkey" PRIMARY KEY ("headId")
);

-- CreateTable
CREATE TABLE "public"."ISPSU_Staff" (
    "staffId" SERIAL NOT NULL,
    "accountId" INTEGER NOT NULL,
    "fName" TEXT NOT NULL,
    "lName" TEXT NOT NULL,
    "mName" TEXT NOT NULL,
    "validated" BOOLEAN NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ISPSU_Staff_pkey" PRIMARY KEY ("staffId")
);

-- CreateTable
CREATE TABLE "public"."Student" (
    "studentId" SERIAL NOT NULL,
    "fName" TEXT NOT NULL,
    "lName" TEXT NOT NULL,
    "mName" TEXT NOT NULL,
    "contactNumber" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "indigenous" BOOLEAN NOT NULL,
    "PWD" BOOLEAN NOT NULL,
    "institute" TEXT NOT NULL,
    "course" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "familyBackground" JSONB NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accountId" INTEGER NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("studentId")
);

-- CreateTable
CREATE TABLE "public"."Auth_Code" (
    "codeId" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "dateExpiry" TIMESTAMP(3) NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Auth_Code_pkey" PRIMARY KEY ("codeId")
);

-- CreateTable
CREATE TABLE "public"."Interview" (
    "interviewId" SERIAL NOT NULL,
    "staffId" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Interview_pkey" PRIMARY KEY ("interviewId")
);

-- CreateTable
CREATE TABLE "public"."Scholarship" (
    "scholarshipId" SERIAL NOT NULL,
    "ISPSUId" INTEGER NOT NULL,
    "SPId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "cover" TEXT NOT NULL,
    "logo" TEXT NOT NULL,
    "form" TEXT NOT NULL,
    "requiredGWA" DOUBLE PRECISION NOT NULL,
    "limit" INTEGER NOT NULL,
    "approved" INTEGER NOT NULL,
    "declined" INTEGER NOT NULL,
    "renew" BOOLEAN NOT NULL,
    "interview" BOOLEAN NOT NULL,
    "archived" BOOLEAN NOT NULL,
    "documents" JSONB NOT NULL,
    "deadline" TIMESTAMP(3) NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Scholarship_pkey" PRIMARY KEY ("scholarshipId")
);

-- CreateTable
CREATE TABLE "public"."Scholarship_Provider" (
    "SPId" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Scholarship_Provider_pkey" PRIMARY KEY ("SPId")
);

-- CreateTable
CREATE TABLE "public"."Staff_Logs" (
    "logsId" SERIAL NOT NULL,
    "staffId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Staff_Logs_pkey" PRIMARY KEY ("logsId")
);

-- CreateTable
CREATE TABLE "public"."Student_Notification" (
    "notificationId" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Student_Notification_pkey" PRIMARY KEY ("notificationId")
);

-- CreateTable
CREATE TABLE "public"."Application" (
    "applicationId" SERIAL NOT NULL,
    "scholarshipId" INTEGER NOT NULL,
    "studentId" INTEGER NOT NULL,
    "decisionId" INTEGER NOT NULL,
    "interviewId" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "submittedDocuments" JSONB NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("applicationId")
);

-- CreateTable
CREATE TABLE "public"."Application_Decision" (
    "decisionId" SERIAL NOT NULL,
    "staffId" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Application_Decision_pkey" PRIMARY KEY ("decisionId")
);

-- CreateTable
CREATE TABLE "public"."Announcement" (
    "announcementId" SERIAL NOT NULL,
    "headId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("announcementId")
);

-- CreateIndex
CREATE UNIQUE INDEX "ISPSU_Head_accountId_key" ON "public"."ISPSU_Head"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "ISPSU_Staff_accountId_key" ON "public"."ISPSU_Staff"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "Student_accountId_key" ON "public"."Student"("accountId");

-- AddForeignKey
ALTER TABLE "public"."ISPSU_Head" ADD CONSTRAINT "ISPSU_Head_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "public"."Account"("accountId") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."ISPSU_Staff" ADD CONSTRAINT "ISPSU_Staff_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "public"."Account"("accountId") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Student" ADD CONSTRAINT "Student_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "public"."Account"("accountId") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Interview" ADD CONSTRAINT "Interview_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "public"."ISPSU_Staff"("staffId") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Scholarship" ADD CONSTRAINT "Scholarship_ISPSUId_fkey" FOREIGN KEY ("ISPSUId") REFERENCES "public"."ISPSU_Head"("headId") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Scholarship" ADD CONSTRAINT "Scholarship_SPId_fkey" FOREIGN KEY ("SPId") REFERENCES "public"."Scholarship_Provider"("SPId") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Staff_Logs" ADD CONSTRAINT "Staff_Logs_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "public"."ISPSU_Staff"("staffId") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Student_Notification" ADD CONSTRAINT "Student_Notification_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("studentId") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Application" ADD CONSTRAINT "Application_decisionId_fkey" FOREIGN KEY ("decisionId") REFERENCES "public"."Application_Decision"("decisionId") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Application" ADD CONSTRAINT "Application_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "public"."Interview"("interviewId") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Application" ADD CONSTRAINT "Application_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("studentId") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Application" ADD CONSTRAINT "Application_scholarshipId_fkey" FOREIGN KEY ("scholarshipId") REFERENCES "public"."Scholarship"("scholarshipId") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Application_Decision" ADD CONSTRAINT "Application_Decision_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "public"."ISPSU_Staff"("staffId") ON DELETE NO ACTION ON UPDATE NO ACTION;
