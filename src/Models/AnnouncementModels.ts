import { Announcement, prisma } from "../lib/prisma"

export const prismaCreateAnnouncement = async (accountId: number, announcementTitle: string, announcementDescription?: string, announcementTags?: {}): Promise<Announcement>=> {
    const announcement = await prisma.announcement.create({
        data:{
            headId: accountId,
            title: announcementTitle,
            description: announcementDescription || "",
            tags: announcementTags || {}
        }
    });
    return  announcement;
}
export const prismaGetAllAnnouncement = async(page?: number, dataPerPage?: number, sortBy?: string, 
    order?: string, status?: string, search?: string): Promise<{ announcements: Announcement[], totalCount:number }>=>{
        const finalSortBy: string|undefined = ["dateCreated"].includes(sortBy as string)? sortBy:undefined
        const finalOrderBy: string = ["asc", "desc"].includes(order as string)? (order as string):"asc"

        const [announcements, totalCount] = await Promise.all([
            prisma.announcement.findMany({
                take: dataPerPage,
                skip: page && dataPerPage? (page - 1) * dataPerPage:undefined,
                where:{
                    ...(search? {
                        OR:[
                            {title: {contains: search, mode: "insensitive"}},
                            {description: {contains: search, mode: "insensitive"}}
                        ]
                    }:{})
                },
                ...(finalSortBy? {
                    orderBy:{
                        [finalSortBy]:order
                    }
                }:{})
            }),
            prisma.announcement.count({
                where:{
                    ...(search? {
                        OR:[
                            {title: {contains: search, mode: "insensitive"}},
                            {description: {contains: search, mode: "insensitive"}}
                        ]
                    }:{})
                },
            })
        ])
    return {announcements, totalCount};
}
export const prismaDeleteAnnouncement = async(announcementIds: number): Promise<number>=>{
    const deleteResult = await prisma.announcement.deleteMany({
        where: {
            announcementId: announcementIds
        }
    });
    return deleteResult.count;
}
export const prismaGetAnnouncementById = async(annoucenmentId: number): Promise<Announcement|null>=> {
    return prisma.announcement.findUnique({where: {announcementId: annoucenmentId}})
}
export const prismaEditAnnouncement = async(announcementId: number, title?: string, description?: string, tags?: {}): Promise<Announcement|null>=> {
    const result = await prisma.announcement.update({
        where:{announcementId: announcementId},
        data:{
            title: title,
            description: description,
            tags: tags
        }
    })
    return result
}