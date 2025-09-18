/*
  Warnings:

  - You are about to drop the column `studentId` on the `Account` table. All the data in the column will be lost.
  - The primary key for the `Student` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `accountId` on the `Student` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[studentId]` on the table `Student` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `studentId` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Application" DROP CONSTRAINT "Application_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Student" DROP CONSTRAINT "Student_accountId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Student_Notification" DROP CONSTRAINT "Student_Notification_ownerId_fkey";

-- DropIndex
DROP INDEX "public"."Student_accountId_key";

-- AlterTable
ALTER TABLE "public"."Account" DROP COLUMN "studentId",
ADD COLUMN     "schoolId" TEXT;

-- AlterTable
ALTER TABLE "public"."Student" DROP CONSTRAINT "Student_pkey",
DROP COLUMN "accountId",
ADD COLUMN     "studentId" INTEGER NOT NULL,
ADD CONSTRAINT "Student_pkey" PRIMARY KEY ("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "Student_studentId_key" ON "public"."Student"("studentId");

-- AddForeignKey
ALTER TABLE "public"."Student" ADD CONSTRAINT "Student_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."Account"("accountId") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Application" ADD CONSTRAINT "Application_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."Student"("studentId") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Student_Notification" ADD CONSTRAINT "Student_Notification_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."Student"("studentId") ON DELETE NO ACTION ON UPDATE NO ACTION;
