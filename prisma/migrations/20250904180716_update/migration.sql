-- DropForeignKey
ALTER TABLE "announcements" DROP CONSTRAINT "announcements_adminId_fkey";

-- DropForeignKey
ALTER TABLE "scholarships" DROP CONSTRAINT "scholarships_adminId_fkey";

-- AlterTable
ALTER TABLE "admin_accounts" ALTER COLUMN "role" SET DEFAULT 'ADMIN';

-- AlterTable
ALTER TABLE "announcements" ALTER COLUMN "adminId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "scholarships" ALTER COLUMN "adminId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "scholarships" ADD CONSTRAINT "scholarships_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admin_accounts"("adminId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admin_accounts"("adminId") ON DELETE SET NULL ON UPDATE CASCADE;
