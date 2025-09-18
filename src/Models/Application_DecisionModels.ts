import { Application, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

export const prismaGetApplicationByIdScholarshipId = async (applicationId: number, scholarshipId: number, status?: string): Promise<Application | null> => {
    const application = await prisma.application.findFirst({
        where: {
            applicationId: applicationId,
            scholarshipId: scholarshipId,
            status: status? status: undefined
        }
    })
    return application
}