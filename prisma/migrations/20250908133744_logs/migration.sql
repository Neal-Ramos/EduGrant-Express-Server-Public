-- AlterTable
ALTER TABLE "staff_accounts" ALTER COLUMN "middleName" DROP NOT NULL;

-- AlterTable
ALTER TABLE "student_accounts" ALTER COLUMN "middleName" DROP NOT NULL;

-- CreateTable
CREATE TABLE "staffLogs" (
    "logsId" SERIAL NOT NULL,
    "staffId" INTEGER NOT NULL,
    "scholarshipId" INTEGER,
    "applicationId" INTEGER,
    "announcementId" INTEGER,
    "action" TEXT NOT NULL,
    "dateLog" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "staffLogs_pkey" PRIMARY KEY ("logsId")
);

-- AddForeignKey
ALTER TABLE "staffLogs" ADD CONSTRAINT "staffLogs_scholarshipId_fkey" FOREIGN KEY ("scholarshipId") REFERENCES "scholarships"("scholarshipId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staffLogs" ADD CONSTRAINT "staffLogs_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "student_applications"("applicationId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staffLogs" ADD CONSTRAINT "staffLogs_announcementId_fkey" FOREIGN KEY ("announcementId") REFERENCES "announcements"("announcementId") ON DELETE SET NULL ON UPDATE CASCADE;
