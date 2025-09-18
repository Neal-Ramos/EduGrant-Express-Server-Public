import { ISPSU_Staff, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const prismaTotalCountStaff = async (accountId?: number): Promise<number> => {
  const count = await prisma.iSPSU_Staff.count({
    where: {
      ...(accountId ? { staffId: accountId } : undefined),
    },
  });
  return count;
}
export const prismaGetStaffAccounts = async (page?: number, dataPerPage?: number, sortBy?: string, id?: number | null, order?: string): Promise<any[]> => {
    const allowedSortByFields: string[] = [
        'fName',
        'lName',
        'mName',
        'validated',
        'dateCreated'
    ]
    const allowedOrderByFields: string[] = ["asc", "desc"];

  const staffAccounts = await prisma.iSPSU_Staff.findMany({
    ...(dataPerPage? { take: dataPerPage } : undefined),
    ...(page && dataPerPage ? { skip: (page - 1) * dataPerPage } : undefined),
    where: {
      ...(id ? { staffId: id } : undefined),
    },
    orderBy: {
      ...(allowedSortByFields.includes(sortBy || '')? {[sortBy as string]: (allowedOrderByFields.includes(order || '')? order : 'asc')}:undefined),
    }
  });
  return staffAccounts;
}
export const prismaSearchISPUStaff = async(search: string, page: number|undefined, dataPerPage: number|undefined, sortBy: string|undefined, 
  order: string|undefined, accountId:number|undefined): Promise<{staffAccounts:ISPSU_Staff[], totalCount:number}> => {
    const allowedSortByFields: string[] = [
        'fName',
        'lName',
        'mName',
        'validated',
        'dateCreated'
    ]
    const allowedOrderByFields: string[] = ["asc", "desc"];

    const searchResult = await prisma.$transaction( async(tx)=>{
        const staffAccounts = await tx.iSPSU_Staff.findMany({
          ...(dataPerPage? { take: dataPerPage } : undefined),
          ...(page && dataPerPage ? { skip: (page - 1) * dataPerPage } : undefined),
          orderBy:{
              ...(allowedSortByFields.includes(sortBy || '')? {[sortBy as string]: (allowedOrderByFields.includes(order || '')? order : 'asc')}:undefined),
          },
          where:{
              OR: [
                  {fName: {contains: search, mode: 'insensitive'}},
                  {lName: {contains: search, mode: 'insensitive'}},
                  {mName: {contains: search, mode: 'insensitive'}}
              ]
          }
        })
        const totalCount = await tx.iSPSU_Staff.count({
          where:{
            OR: [
                {fName: {contains: search, mode: 'insensitive'}},
                {lName: {contains: search, mode: 'insensitive'}},
                {mName: {contains: search, mode: 'insensitive'}}
            ]
          }
        })
        return {staffAccounts, totalCount}
    })
    return searchResult
}