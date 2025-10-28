-- CreateTable
CREATE TABLE "public"."Account" (
    "accountId" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "hashedPassword" TEXT NOT NULL,
    "schoolId" TEXT,
    "role" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("accountId")
);

-- CreateTable
CREATE TABLE "public"."ISPSU_Head" (
    "headId" INTEGER NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fName" TEXT NOT NULL,
    "lName" TEXT NOT NULL,
    "mName" TEXT,

    CONSTRAINT "ISPSU_Head_pkey" PRIMARY KEY ("headId")
);

-- CreateTable
CREATE TABLE "public"."ISPSU_Staff" (
    "staffId" INTEGER NOT NULL,
    "fName" TEXT NOT NULL,
    "lName" TEXT NOT NULL,
    "mName" TEXT,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ISPSU_Staff_pkey" PRIMARY KEY ("staffId")
);

-- CreateTable
CREATE TABLE "public"."Student" (
    "studentId" INTEGER NOT NULL,
    "fName" TEXT NOT NULL,
    "lName" TEXT NOT NULL,
    "mName" TEXT,
    "contactNumber" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "indigenous" TEXT,
    "PWD" TEXT,
    "institute" TEXT NOT NULL,
    "course" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "familyBackground" JSONB,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("studentId")
);

-- CreateTable
CREATE TABLE "public"."Auth_Code" (
    "codeId" SERIAL NOT NULL,
    "owner" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "dateExpiry" TIMESTAMP(3) NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Auth_Code_pkey" PRIMARY KEY ("codeId")
);

-- CreateTable
CREATE TABLE "public"."Scholarship_Provider" (
    "SPId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Scholarship_Provider_pkey" PRIMARY KEY ("SPId")
);

-- CreateTable
CREATE TABLE "public"."Scholarship" (
    "scholarshipId" SERIAL NOT NULL,
    "ISPSUId" INTEGER,
    "title" TEXT NOT NULL,
    "amount" TEXT,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "cover" TEXT NOT NULL,
    "logo" TEXT NOT NULL,
    "supabasePath" JSONB NOT NULL,
    "form" TEXT,
    "requiredGWA" DOUBLE PRECISION,
    "limit" INTEGER,
    "pending" INTEGER NOT NULL,
    "approved" INTEGER NOT NULL,
    "declined" INTEGER NOT NULL,
    "phase" INTEGER NOT NULL DEFAULT 1,
    "interview" BOOLEAN NOT NULL,
    "archived" BOOLEAN NOT NULL,
    "documents" JSONB NOT NULL,
    "deadline" TIMESTAMP(3) NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Scholarship_pkey" PRIMARY KEY ("scholarshipId")
);

-- CreateTable
CREATE TABLE "public"."Application" (
    "applicationId" SERIAL NOT NULL,
    "scholarshipId" INTEGER,
    "ownerId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "supabasePath" JSONB NOT NULL,
    "submittedDocuments" JSONB NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("applicationId")
);

-- CreateTable
CREATE TABLE "public"."Application_Decision" (
    "decisionId" INTEGER NOT NULL,
    "staffId" INTEGER,
    "status" TEXT NOT NULL,
    "message" JSONB,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Application_Decision_pkey" PRIMARY KEY ("decisionId")
);

-- CreateTable
CREATE TABLE "public"."Interview_Decision" (
    "interviewId" SERIAL NOT NULL,
    "staffId" INTEGER,
    "status" TEXT NOT NULL,
    "message" JSONB,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Interview_Decision_pkey" PRIMARY KEY ("interviewId")
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
    "ownerId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Student_Notification_pkey" PRIMARY KEY ("notificationId")
);

-- CreateTable
CREATE TABLE "public"."Announcement" (
    "announcementId" SERIAL NOT NULL,
    "headId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "tags" JSONB NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("announcementId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_email_key" ON "public"."Account"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Student_studentId_key" ON "public"."Student"("studentId");

-- AddForeignKey
ALTER TABLE "public"."ISPSU_Head" ADD CONSTRAINT "ISPSU_Head_headId_fkey" FOREIGN KEY ("headId") REFERENCES "public"."Account"("accountId") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."ISPSU_Staff" ADD CONSTRAINT "ISPSU_Staff_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "public"."Account"("accountId") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Student" ADD CONSTRAINT "Student_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."Account"("accountId") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Scholarship_Provider" ADD CONSTRAINT "Scholarship_Provider_SPId_fkey" FOREIGN KEY ("SPId") REFERENCES "public"."Scholarship"("scholarshipId") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Scholarship" ADD CONSTRAINT "Scholarship_ISPSUId_fkey" FOREIGN KEY ("ISPSUId") REFERENCES "public"."ISPSU_Head"("headId") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Application" ADD CONSTRAINT "Application_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."Student"("studentId") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Application" ADD CONSTRAINT "Application_scholarshipId_fkey" FOREIGN KEY ("scholarshipId") REFERENCES "public"."Scholarship"("scholarshipId") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Application_Decision" ADD CONSTRAINT "Application_Decision_decisionId_fkey" FOREIGN KEY ("decisionId") REFERENCES "public"."Application"("applicationId") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Application_Decision" ADD CONSTRAINT "Application_Decision_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "public"."ISPSU_Staff"("staffId") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Interview_Decision" ADD CONSTRAINT "Interview_Decision_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "public"."Application"("applicationId") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Interview_Decision" ADD CONSTRAINT "Interview_Decision_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "public"."ISPSU_Staff"("staffId") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Staff_Logs" ADD CONSTRAINT "Staff_Logs_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "public"."ISPSU_Staff"("staffId") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Student_Notification" ADD CONSTRAINT "Student_Notification_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."Student"("studentId") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Announcement" ADD CONSTRAINT "Announcement_headId_fkey" FOREIGN KEY ("headId") REFERENCES "public"."ISPSU_Head"("headId") ON DELETE NO ACTION ON UPDATE NO ACTION;
