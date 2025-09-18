import { PrismaClient, Student_Notification } from "@prisma/client";

const prisma = new PrismaClient()

export const prismaGetAllNotifications = async(accountId: number, page: number|undefined, dataPerPage: number|undefined, status: string|undefined, 
    sortBy: string|undefined, order: string|undefined): Promise<{notification:Student_Notification[], totalCount:number}>=> {
    const transac = await prisma.$transaction(async (tx) => {
        const notification = await tx.student_Notification.findMany({
            ...(page && dataPerPage? {skip:(page - 1) * dataPerPage}: undefined),
            skip:dataPerPage? dataPerPage:undefined,
            where:{
                ownerId:accountId
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