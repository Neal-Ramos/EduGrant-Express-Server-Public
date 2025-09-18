/*
  Warnings:

  - You are about to drop the column `announcementContent` on the `announcements` table. All the data in the column will be lost.
  - You are about to drop the column `announcementDate` on the `announcements` table. All the data in the column will be lost.
  - You are about to drop the column `announcementFile` on the `announcements` table. All the data in the column will be lost.
  - You are about to drop the column `announcementTitle` on the `announcements` table. All the data in the column will be lost.
  - Added the required column `description` to the `announcements` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expiredDate` to the `announcements` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `announcements` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tags` to the `announcements` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `announcements` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "announcements" DROP COLUMN "announcementContent",
DROP COLUMN "announcementDate",
DROP COLUMN "announcementFile",
DROP COLUMN "announcementTitle",
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "expiredDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "tags" JSONB NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL;
