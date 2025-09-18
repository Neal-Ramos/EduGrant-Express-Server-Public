-- AlterTable
ALTER TABLE "user_applications" ADD COLUMN     "adminId" INTEGER;

-- AddForeignKey
ALTER TABLE "user_applications" ADD CONSTRAINT "user_applications_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admin_accounts"("adminId") ON DELETE SET NULL ON UPDATE CASCADE;
