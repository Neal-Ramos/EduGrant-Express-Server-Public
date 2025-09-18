/*
  Warnings:

  - The primary key for the `Auth_Code` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `codeId` column on the `Auth_Code` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."Auth_Code" DROP CONSTRAINT "Auth_Code_pkey",
DROP COLUMN "codeId",
ADD COLUMN     "codeId" SERIAL NOT NULL,
ADD CONSTRAINT "Auth_Code_pkey" PRIMARY KEY ("codeId");
