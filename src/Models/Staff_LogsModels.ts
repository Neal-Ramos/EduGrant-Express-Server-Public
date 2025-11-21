import { prisma, Staff_Logs } from '../lib/prisma';

export const prismaCreateStaffLog = async (ownerId: number, scholarshipId: number, applicationId: number, action: string): Promise<Staff_Logs | null> => {
  const result = await prisma.staff_Logs.create({
    data: {
      staffId: ownerId,
      scholarshipId: scholarshipId,
      applicationId: applicationId,
      action: action,
      description: '',
    },
  });

  return result;
};
export const prismaGetStaffLogs = async (
  isHead: boolean,
  page?: number,
  dataPerPage?: number,
  sortBy?: string,
  order?: string,
  ownderId?: number,
  filters?: { id: string; value: [string] }[],
): Promise<{ logs: Staff_Logs[]; totalCount: number }> => {
  const allowedOrder: string[] = ['staffId', 'scholarshipId', 'applicationId', 'action', 'description', 'dateCreated'];
  const allowedOrderByStaff: string[] = ['fName', 'lName', 'mName', 'dateCreated'];
  const [logs, totalCount] = await Promise.all([
    prisma.staff_Logs.findMany({
      take: dataPerPage,
      skip: page && dataPerPage ? (page - 1) * dataPerPage : undefined,
      orderBy: [
        ...(allowedOrder.includes(sortBy || '') ? [{ [sortBy as string]: order || 'asc' }] : []),
        ...(allowedOrderByStaff.includes(sortBy || '') ? [{ ISPSU_Staff: { [sortBy as string]: order || 'asc' } }] : []),
      ],
      where: {
        ...(!isHead ? { staffId: ownderId } : {}),
        application: {
          Student: {
            course: { in: filters?.find((f) => f.id == 'course')?.value },
            year: { in: filters?.find((f) => f.id == 'year')?.value },
            section: { in: filters?.find((f) => f.id == 'section')?.value },
            institute: { in: filters?.find((f) => f.id == 'institute')?.value },
          },
        },
      },
      include: {
        scholarship: {
          include: {
            Scholarship_Provider: {
              select: {
                SPId: true,
                name: true,
              },
            },
          },
        },
        application: {
          include: {
            Student: {
              include: {
                Account: {
                  select: {
                    email: true,
                    schoolId: true,
                  },
                },
              },
            },
          },
        },
        ISPSU_Staff: true,
      },
    }),
    prisma.staff_Logs.count({
      where: {
        ...(!isHead ? { staffId: ownderId } : {}),
        application: {
          Student: {
            course: { in: filters?.find((f) => f.id == 'course')?.value },
            year: { in: filters?.find((f) => f.id == 'year')?.value },
            section: { in: filters?.find((f) => f.id == 'section')?.value },
            institute: { in: filters?.find((f) => f.id == 'institute')?.value },
          },
        },
      },
    }),
  ]);

  return { logs, totalCount };
};
