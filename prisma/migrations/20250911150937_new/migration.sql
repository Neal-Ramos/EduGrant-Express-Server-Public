/*
  Warnings:

  - You are about to drop the column `studentId` on the `Application` table. All the data in the column will be lost.
  - Added the required column `Id` to the `Application` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Application" DROP CONSTRAINT "Application_studentId_fkey";

-- AlterTable
ALTER TABLE "public"."Application" DROP COLUMN "studentId",
ADD COLUMN     "Id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Application" ADD CONSTRAINT "Application_Id_fkey" FOREIGN KEY ("Id") REFERENCES "public"."Student"("Id") ON DELETE NO ACTION ON UPDATE NO ACTION;
