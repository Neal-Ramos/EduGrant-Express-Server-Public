import { Application, Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

type AccountWithRelations = Prisma.ApplicationGetPayload<{
    include: {Student: {include: {Account: true}}}
}>

export const prismaGetApplicationByIdScholarshipId = async (applicationId: number, scholarshipId: number, status?: string): Promise<AccountWithRelations | null> => {
    const application = await prisma.application.findFirst({
        where: {
            applicationId: applicationId,
            scholarshipId: scholarshipId,
            status: status? status: undefined
        },
        include:{
            Student: {
                include: {
                    Account: true
                }
            },
        }
    })
    return application
}