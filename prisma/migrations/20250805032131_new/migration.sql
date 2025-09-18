-- CreateTable
CREATE TABLE "admin_accounts" (
    "adminId" SERIAL NOT NULL,
    "adminEmail" TEXT NOT NULL,
    "adminName" TEXT NOT NULL,
    "adminPassword" TEXT NOT NULL,

    CONSTRAINT "admin_accounts_pkey" PRIMARY KEY ("adminId")
);

-- CreateTable
CREATE TABLE "announcements" (
    "announcementId" SERIAL NOT NULL,
    "announcementTitle" TEXT NOT NULL,
    "announcementDate" TIMESTAMP(3) NOT NULL,
    "announcementFile" JSONB NOT NULL,
    "announcementContent" JSONB NOT NULL,

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("announcementId")
);

-- CreateTable
CREATE TABLE "scholarships" (
    "scholarshipId" SERIAL NOT NULL,
    "scholarshipProvider" TEXT NOT NULL,
    "scholarshipTitle" TEXT NOT NULL,
    "scholarshipDealine" TIMESTAMP(3) NOT NULL,
    "scholarshipStartDate" TIMESTAMP(3) NOT NULL,
    "scholarshipAmount" DOUBLE PRECISION NOT NULL,
    "scholarshipLimit" INTEGER NOT NULL,
    "scholarshipLogo" TEXT NOT NULL,
    "scholarshipCover" TEXT NOT NULL,
    "scholarshipDescription" TEXT NOT NULL,
    "scholarshipCloudinaryId" JSONB NOT NULL,
    "scholarshipDocuments" JSONB NOT NULL,
    "totalApplicants" INTEGER NOT NULL DEFAULT 0,
    "totalApproved" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "scholarships_pkey" PRIMARY KEY ("scholarshipId")
);

-- CreateTable
CREATE TABLE "scholarships_archive" (
    "archiveId" SERIAL NOT NULL,
    "scholarshipId" INTEGER NOT NULL,
    "scholarshipName" TEXT NOT NULL,
    "scholarshipDeadline" TIMESTAMP(3) NOT NULL,
    "scholarshipLogo" TEXT NOT NULL,
    "scholarshipCover" TEXT NOT NULL,
    "scholarshipDescription" TEXT NOT NULL,
    "scholarshipDocuments" JSONB NOT NULL,
    "scholarshipApplicants" INTEGER NOT NULL,
    "scholarshipApproved" INTEGER NOT NULL,

    CONSTRAINT "scholarships_archive_pkey" PRIMARY KEY ("archiveId")
);

-- CreateTable
CREATE TABLE "security_code" (
    "codeId" SERIAL NOT NULL,
    "origin" TEXT NOT NULL,
    "receiver" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "security_code_pkey" PRIMARY KEY ("codeId")
);

-- CreateTable
CREATE TABLE "user_accounts" (
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

    CONSTRAINT "user_accounts_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "user_applications" (
    "applicationId" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "scholarshipId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "applicationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "applicationResponseDate" TIMESTAMP(3),
    "userDocuments" JSONB NOT NULL,

    CONSTRAINT "user_applications_pkey" PRIMARY KEY ("applicationId")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_accounts_adminEmail_key" ON "admin_accounts"("adminEmail");

-- CreateIndex
CREATE UNIQUE INDEX "user_accounts_studentEmail_key" ON "user_accounts"("studentEmail");

-- CreateIndex
CREATE UNIQUE INDEX "user_accounts_studentId_key" ON "user_accounts"("studentId");

-- AddForeignKey
ALTER TABLE "scholarships_archive" ADD CONSTRAINT "scholarships_archive_scholarshipId_fkey" FOREIGN KEY ("scholarshipId") REFERENCES "scholarships"("scholarshipId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_applications" ADD CONSTRAINT "user_applications_scholarshipId_fkey" FOREIGN KEY ("scholarshipId") REFERENCES "scholarships"("scholarshipId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_applications" ADD CONSTRAINT "user_applications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user_accounts"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
