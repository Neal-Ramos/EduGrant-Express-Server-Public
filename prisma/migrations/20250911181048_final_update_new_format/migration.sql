/*
  Warnings:

  - You are about to drop the column `Id` on the `Application` table. All the data in the column will be lost.
  - The primary key for the `Student` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `Id` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `studentId` on the `Student_Notification` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[accountId]` on the table `Student` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `ownerId` to the `Application` table without a default value. This is not possible if the table is not empty.
  - Added the required column `accountId` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ownerId` to the `Student_Notification` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Application" DROP CONSTRAINT "Application_Id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Student" DROP CONSTRAINT "Student_Id_fkey";

-- DropForeignKey
ALTER TABLE "public"."Student_Notification" DROP CONSTRAINT "Student_Notification_studentId_fkey";

-- DropIndex
DROP INDEX "public"."Student_Id_key";

-- AlterTable
ALTER TABLE "public"."Application" DROP COLUMN "Id",
ADD COLUMN     "ownerId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."Student" DROP CONSTRAINT "Student_pkey",
DROP COLUMN "Id",
ADD COLUMN     "accountId" INTEGER NOT NULL,
ADD CONSTRAINT "Student_pkey" PRIMARY KEY ("accountId");

-- AlterTable
ALTER TABLE "public"."Student_Notification" DROP COLUMN "studentId",
ADD COLUMN     "ownerId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Student_accountId_key" ON "public"."Student"("accountId");

-- AddForeignKey
ALTER TABLE "public"."Student" ADD CONSTRAINT "Student_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "public"."Account"("accountId") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Application" ADD CONSTRAINT "Application_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."Student"("accountId") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."Student_Notification" ADD CONSTRAINT "Student_Notification_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."Student"("accountId") ON DELETE NO ACTION ON UPDATE NO ACTION;
