-- CreateTable
CREATE TABLE "Account" (
    "accountId" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "hashedPassword" TEXT NOT NULL,
    "schoolId" TEXT,
    "role" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "webTours" JSONB NOT NULL DEFAULT '{"dashboardTour": false}',

    CONSTRAINT "Account_pkey" PRIMARY KEY ("accountId")
);

-- CreateTable
CREATE TABLE "ISPSU_Head" (
    "headId" INTEGER NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fName" TEXT NOT NULL,
    "lName" TEXT NOT NULL,
    "mName" TEXT,
    "addres" TEXT,
    "gender" TEXT,
    "profileImg" JSONB,

    CONSTRAINT "ISPSU_Head_pkey" PRIMARY KEY ("headId")
);

-- CreateTable
CREATE TABLE "ISPSU_Staff" (
    "staffId" INTEGER NOT NULL,
    "fName" TEXT NOT NULL,
    "lName" TEXT NOT NULL,
    "mName" TEXT,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "profileImg" JSONB,
    "validated" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ISPSU_Staff_pkey" PRIMARY KEY ("staffId")
);

-- CreateTable
CREATE TABLE "Student" (
    "studentId" INTEGER NOT NULL,
    "fName" TEXT NOT NULL,
    "lName" TEXT NOT NULL,
    "mName" TEXT,
    "prefixName" TEXT,
    "contactNumber" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "indigenous" TEXT NOT NULL DEFAULT '',
    "PWD" TEXT NOT NULL DEFAULT '',
    "institute" TEXT NOT NULL,
    "course" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "familyBackground" JSONB,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "profileImg" JSONB,
    "civilStatus" TEXT NOT NULL,
    "dswdMember" BOOLEAN NOT NULL,
    "fourPsMember" BOOLEAN NOT NULL,
    "studentType" TEXT NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("studentId")
);

-- CreateTable
CREATE TABLE "Auth_Code" (
    "codeId" SERIAL NOT NULL,
    "owner" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "dateExpiry" TIMESTAMP(3) NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Auth_Code_pkey" PRIMARY KEY ("codeId")
);

-- CreateTable
CREATE TABLE "Scholarship_Provider" (
    "SPId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Scholarship_Provider_pkey" PRIMARY KEY ("SPId")
);

-- CreateTable
CREATE TABLE "Scholarship" (
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
    "interview" BOOLEAN NOT NULL DEFAULT false,
    "documents" JSONB NOT NULL,
    "deadline" TIMESTAMP(3) NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended" BOOLEAN NOT NULL DEFAULT false,
    "dateEnded" TIMESTAMP(3),

    CONSTRAINT "Scholarship_pkey" PRIMARY KEY ("scholarshipId")
);

-- CreateTable
CREATE TABLE "Application" (
    "applicationId" SERIAL NOT NULL,
    "scholarshipId" INTEGER NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "supabasePath" JSONB NOT NULL,
    "submittedDocuments" JSONB NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("applicationId")
);

-- CreateTable
CREATE TABLE "Application_Decision" (
    "decisionId" SERIAL NOT NULL,
    "staffId" INTEGER,
    "status" TEXT NOT NULL,
    "message" JSONB,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "applicationId" INTEGER NOT NULL,
    "scholarshipPhase" INTEGER NOT NULL,

    CONSTRAINT "Application_Decision_pkey" PRIMARY KEY ("decisionId")
);

-- CreateTable
CREATE TABLE "Interview_Decision" (
    "interviewId" SERIAL NOT NULL,
    "staffId" INTEGER,
    "status" TEXT NOT NULL,
    "message" JSONB,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "applicationId" INTEGER NOT NULL,
    "scholarshipPhase" INTEGER NOT NULL,

    CONSTRAINT "Interview_Decision_pkey" PRIMARY KEY ("interviewId")
);

-- CreateTable
CREATE TABLE "Staff_Logs" (
    "logsId" SERIAL NOT NULL,
    "staffId" INTEGER,
    "action" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "applicationId" INTEGER NOT NULL,
    "scholarshipId" INTEGER NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Staff_Logs_pkey" PRIMARY KEY ("logsId")
);

-- CreateTable
CREATE TABLE "Student_Notification" (
    "notificationId" SERIAL NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "applicationId" INTEGER NOT NULL,
    "scholarshipId" INTEGER NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "Student_Notification_pkey" PRIMARY KEY ("notificationId")
);

-- CreateTable
CREATE TABLE "Announcement" (
    "announcementId" SERIAL NOT NULL,
    "headId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "tags" JSONB NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("announcementId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_email_key" ON "Account"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Student_studentId_key" ON "Student"("studentId");

-- AddForeignKey
ALTER TABLE "ISPSU_Head" ADD CONSTRAINT "ISPSU_Head_headId_fkey" FOREIGN KEY ("headId") REFERENCES "Account"("accountId") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ISPSU_Staff" ADD CONSTRAINT "ISPSU_Staff_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Account"("accountId") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Account"("accountId") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Scholarship_Provider" ADD CONSTRAINT "Scholarship_Provider_SPId_fkey" FOREIGN KEY ("SPId") REFERENCES "Scholarship"("scholarshipId") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Scholarship" ADD CONSTRAINT "Scholarship_ISPSUId_fkey" FOREIGN KEY ("ISPSUId") REFERENCES "ISPSU_Head"("headId") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Student"("studentId") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_scholarshipId_fkey" FOREIGN KEY ("scholarshipId") REFERENCES "Scholarship"("scholarshipId") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Application_Decision" ADD CONSTRAINT "Application_Decision_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("applicationId") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Application_Decision" ADD CONSTRAINT "Application_Decision_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "ISPSU_Staff"("staffId") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Interview_Decision" ADD CONSTRAINT "Interview_Decision_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("applicationId") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Interview_Decision" ADD CONSTRAINT "Interview_Decision_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "ISPSU_Staff"("staffId") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Staff_Logs" ADD CONSTRAINT "Staff_Logs_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("applicationId") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Staff_Logs" ADD CONSTRAINT "Staff_Logs_scholarshipId_fkey" FOREIGN KEY ("scholarshipId") REFERENCES "Scholarship"("scholarshipId") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Staff_Logs" ADD CONSTRAINT "Staff_Logs_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "ISPSU_Staff"("staffId") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Student_Notification" ADD CONSTRAINT "Student_Notification_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("applicationId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student_Notification" ADD CONSTRAINT "Student_Notification_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Student"("studentId") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Student_Notification" ADD CONSTRAINT "Student_Notification_scholarshipId_fkey" FOREIGN KEY ("scholarshipId") REFERENCES "Scholarship"("scholarshipId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_headId_fkey" FOREIGN KEY ("headId") REFERENCES "ISPSU_Head"("headId") ON DELETE NO ACTION ON UPDATE NO ACTION;
