-- CreateTable
CREATE TABLE "notifications" (
    "notificationId" SERIAL NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'UNREAD',

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("notificationId")
);

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "student_accounts"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
