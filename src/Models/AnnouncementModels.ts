import { Announcement, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const prismaCreateAnnouncement = async (accountId: number, announcementTitle: string, announcementDescription: string, announcementTags: {}): Promise<Announcement>=> {
    const announcement = await prisma.announcement.create({
        data:{
            headId: accountId,
            title: announcementTitle,
            description: announcementDescription,
            tags: announcementTags
        }
    });
    return  announcement;
}
export const prismaGetAllAnnouncement = async(page: number|undefined, dataPerPage: number|undefined, sortBy: string|undefined, 
    order: string|undefined, status: string|undefined): Promise<{ announcements: Announcement[], totalCount:number }>=>{
    const transac = await prisma.$transaction(async (tx) => {
        const announcements = await tx.announcement.findMany({
            ...(dataPerPage? { take: dataPerPage } : undefined),
            ...(dataPerPage && page ? { skip: (page - 1) * dataPerPage, take: dataPerPage } : undefined),
        });
        const totalCount = await tx.announcement.count();
        return { announcements, totalCount };
    
    })
    return transac;
}
export const prismaDeleteAnnouncement = async(announcementIds: number[]): Promise<number>=>{
    const deleteResult = await prisma.announcement.deleteMany({
        where: {
            announcementId: {
                in: announcementIds
            }
        }
    });
    return deleteResult.count;
}