import { ISPSU_Staff, Prisma, PrismaClient } from "@prisma/client";
import { ResponseUploadSupabase } from "../Config/Supabase";

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
      staffId: id? id:undefined,
      Account: {role: "ISPSU_Staff"}
    },
    orderBy: [
      ...(allowedSortByFields.includes(sortBy || '')? [{[sortBy as string]: (allowedOrderByFields.includes(order || '')? order : 'asc')}]:[]),
    ]
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
          orderBy:[
              ...(allowedSortByFields.includes(sortBy || '')? [{[sortBy as string]: (allowedOrderByFields.includes(order || '')? order : 'asc')}]:[]),
          ],
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
type prismaGetStaffById = Prisma.ISPSU_StaffGetPayload<{
  include:{
    Staff_Logs: true
  }
}>
export const prismaGetStaffById = async(accountId: number): Promise<prismaGetStaffById|null>=> {
  const staff = await prisma.iSPSU_Staff.findUnique({
    where:{
      staffId: accountId
    },
    include:{
      Account:{select:{email: true}},
      Staff_Logs: true,
    }
  })
  return staff
}
export const prismaUpdateStaffInfo = async(accountId: number, fName?: string, mName?: string, lName?: string, newProfileImg?: ResponseUploadSupabase): Promise<ISPSU_Staff|undefined>=> {
  const update = await prisma.iSPSU_Staff.update({
    where:{
      staffId: accountId
    },
    data:{
      fName: fName,
      lName: lName,
      mName: mName,
      profileImg: {
        path: newProfileImg?.path,
        publicUrl: newProfileImg?.publicUrl
      }
    }
  })

  return update
}
export const prismaValidateStaff = async(staffId: number, validatedValue: boolean): Promise<ISPSU_Staff|null>=>{
  const validateStaff = await prisma.iSPSU_Staff.update({
    where:{
      staffId: staffId
    },
    data:{
      validated: validatedValue
    }
  })
  return validateStaff
}