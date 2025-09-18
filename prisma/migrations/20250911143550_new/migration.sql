/*
  Warnings:

  - You are about to drop the column `accountId` on the `ISPSU_Head` table. All the data in the column will be lost.
  - You are about to drop the column `accountId` on the `ISPSU_Staff` table. All the data in the column will be lost.
  - The primary key for the `Student` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `accountId` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `studentId` on the `Student` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[Id]` on the table `Student` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `Id` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Application" DROP CONSTRAINT "Application_studentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ISPSU_Head" DROP CONSTRAINT "ISPSU_Head_accountId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ISPSU_Staff" DROP CONSTRAINT "ISPSU_Staff_accountId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Student" DROP CONSTRAINT "Student_accountId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Student_Notification" DROP CONSTRAINT "Student_Notification_studentId_fkey";

-- DropIndex
DROP INDEX "public"."ISPSU_Head_accountId_key";

-- DropIndex
DROP INDEX "public"."ISPSU_Staff_accountId_key";

-- DropIndex
DROP INDEX "public"."Student_accountId_key";

-- AlterTable
ALTER TABLE "public"."Account" ADD COLUMN     "studentId" TEXT;

-- AlterTable
ALTER TABLE "public"."ISPSU_Head" DROP COLUMN "accountId",
ALTER COLUMN "headId" DROP DEFAULT;
DROP SEQUENCE "ISPSU_Head_headId_seq";

-- AlterTable
ALTER TABLE "public"."ISPSU_Staff" DROP COLUMN "accountId",
ALTER COLUMN "staffId" DROP DEFAULT;
DROP SEQUENCE "ISPSU_Staff_staffId_seq";

-- AlterTable
ALTER TABLE "public"."Student" DROP CONSTRAINT "Student_pkey",
DROP COLUMN "accountId",
DROP COLUMN "studentId",
ADD COLUMN     "Id" INTEGER NOT NULL,
ADD CONSTRAINT "Student_pkey" PRIMARY KEY ("Id");

-- CreateIndex
CREATE UNIQUE INDEX "Student_Id_key" ON "public"."Student"("Id");

-- AddForeignKey
ALTER TABLE "public"."ISPSU_Head" ADD CONSTRAINT "ISPSU_Head_headId_fkey" FOREIGN KEY ("headId") REFERENCES "public"."Account"("accountId") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."ISPSU_Staff" ADD CONSTRAINT "ISPSU_Staff_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "public"."Account"("accountId") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Student" ADD CONSTRAINT "Student_Id_fkey" FOREIGN KEY ("Id") REFERENCES "public"."Account"("accountId") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Application" ADD CONSTRAINT "Application_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("Id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Student_Notification" ADD CONSTRAINT "Student_Notification_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("Id") ON DELETE NO ACTION ON UPDATE NO ACTION;
