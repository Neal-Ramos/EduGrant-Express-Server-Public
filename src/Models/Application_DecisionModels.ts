import { prismaGetApplicationByIdScholarshipIdType } from '../Types/Application_DecisionTypes';
import { prisma } from '../lib/prisma';

export const prismaGetApplicationByIdScholarshipId = async (applicationId: number, scholarshipId: number, status?: string): Promise<prismaGetApplicationByIdScholarshipIdType | null> => {
  const application = await prisma.application.findFirst({
    where: {
      applicationId: applicationId,
      scholarshipId: scholarshipId,
      status: status ? status : undefined,
    },
    include: {
      Student: {
        include: {
          Account: true,
        },
      },
    },
  });
  return application;
};
