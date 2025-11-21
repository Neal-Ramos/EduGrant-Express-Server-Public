import { Student_Notification } from "@prisma/client";
import { prisma } from "../lib/prisma"

export const prismaGetAllNotifications = async(accountId: number, page: number|undefined, dataPerPage: number|undefined, status: string|undefined, 
    sortBy: string|undefined, order: string|undefined): Promise<{notification:Student_Notification[], totalCount:number}>=> {
    const allowedSortBy: string[] = ["ownerId", "applicationId", "scholarshipId", "title", "description", "status", "read", "dateCreated"]
    const transac = await prisma.$transaction(async (tx) => {
        const notification = await tx.student_Notification.findMany({
            take: dataPerPage,
            ...(page && dataPerPage? {skip:(page - 1) * dataPerPage}: undefined),
            where:{
                ownerId:accountId
            },
            include: {
                scholarship: true,
                application: true
            },
            orderBy: {
                ...(allowedSortBy.includes(sortBy||"")? {[sortBy as string]: order}:{})
            }
        })
        const totalCount = await tx.student_Notification.count({
            where:{
                ownerId:accountId
            }
        })
        return {notification, totalCount}
    })
    return transac
}
export const prismaGetUnreadNotificationsCount = async(accountId: number): Promise<number>=> {
    return prisma.student_Notification.count({where: {ownerId: accountId, read: false}})
}
export const prismaReadTrueNotification = async(accountId: number, notifiactionId: number): Promise<Student_Notification>=> {
    const read = await prisma.student_Notification.update({
        where: {
            ownerId: accountId,
            notificationId: notifiactionId
        },
        data:{
            read: true
        }
    })
    return read
}
export const prismaReadAllNotifications = async(accountId: number): Promise<number>=> {
    const read = await prisma.student_Notification.updateMany({
        where:{
            ownerId: accountId
        },
        data:{
            read: true
        }
    })
    return read.count
}