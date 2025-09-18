-- AlterTable
ALTER TABLE "student_applications" ADD COLUMN     "applicationReviewedDate" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "superAdminAccount" (
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

    CONSTRAINT "superAdminAccount_pkey" PRIMARY KEY ("superAdminId")
);

-- CreateIndex
CREATE UNIQUE INDEX "superAdminAccount_email_key" ON "superAdminAccount"("email");
