import { ResponseUploadSupabase } from '../Config/Supabase';
import { prismaGetStaffAccountsType, prismaGetStaffByIdType } from '../Types/ISPSU_StaffTypes';
import { Account, ISPSU_Staff, prisma } from '../lib/prisma';

export const prismaTotalCountStaff = async (accountId?: number): Promise<number> => {
  const count = await prisma.iSPSU_Staff.count({
    where: {
      ...(accountId ? { staffId: accountId } : undefined),
    },
  });
  return count;
};
export const prismaGetStaffAccounts = async (
  page?: number,
  dataPerPage?: number,
  sortBy?: string,
  id?: number | null,
  order?: string,
): Promise<prismaGetStaffAccountsType[]> => {
  const allowedSortByFields: string[] = ['fName', 'lName', 'mName', 'validated', 'dateCreated'];
  const allowedOrderByFields: string[] = ['asc', 'desc'];

  const staffAccounts = await prisma.account.findMany({
    ...(dataPerPage ? { take: dataPerPage } : undefined),
    ...(page && dataPerPage ? { skip: (page - 1) * dataPerPage } : undefined),
    where: {
      accountId: id ? id : undefined,
      role: 'ISPSU_Staff',
    },
    orderBy: [
      ...(allowedSortByFields.includes(sortBy || '')
        ? [{ [sortBy as string]: allowedOrderByFields.includes(order || '') ? order : 'asc' }]
        : []),
    ],
    include: {
      ISPSU_Staff: true,
    },
  });
  return staffAccounts;
};
export const prismaSearchISPUStaff = async (
  search: string,
  page: number | undefined,
  dataPerPage: number | undefined,
  sortBy: string | undefined,
  order: string | undefined,
  accountId: number | undefined,
): Promise<{ staffAccounts: ISPSU_Staff[]; totalCount: number }> => {
  const allowedSortByFields: string[] = ['fName', 'lName', 'mName', 'validated', 'dateCreated'];
  const allowedOrderByFields: string[] = ['asc', 'desc'];

  const searchResult = await prisma.$transaction(async (tx) => {
    const staffAccounts = await tx.iSPSU_Staff.findMany({
      ...(dataPerPage ? { take: dataPerPage } : undefined),
      ...(page && dataPerPage ? { skip: (page - 1) * dataPerPage } : undefined),
      orderBy: [
        ...(allowedSortByFields.includes(sortBy || '')
          ? [{ [sortBy as string]: allowedOrderByFields.includes(order || '') ? order : 'asc' }]
          : []),
      ],
      where: {
        OR: [
          { fName: { contains: search, mode: 'insensitive' } },
          { lName: { contains: search, mode: 'insensitive' } },
          { mName: { contains: search, mode: 'insensitive' } },
        ],
      },
    });
    const totalCount = await tx.iSPSU_Staff.count({
      where: {
        OR: [
          { fName: { contains: search, mode: 'insensitive' } },
          { lName: { contains: search, mode: 'insensitive' } },
          { mName: { contains: search, mode: 'insensitive' } },
        ],
      },
    });
    return { staffAccounts, totalCount };
  });
  return searchResult;
};
export const prismaGetStaffById = async (
  accountId: number,
): Promise<prismaGetStaffByIdType | null> => {
  const staff = await prisma.account.findUnique({
    where: {
      accountId: accountId,
    },
    include: {
      ISPSU_Staff: true,
    },
  });
  return staff;
};
export const prismaUpdateStaffInfo = async (
  accountId: number,
  fName?: string,
  mName?: string,
  lName?: string,
  newProfileImg?: ResponseUploadSupabase,
): Promise<Account | undefined> => {
  const update = await prisma.account.update({
    where: {
      accountId: accountId,
    },
    data: {
      ISPSU_Staff: {
        update: {
          fName: fName,
          lName: lName,
          mName: mName,
          profileImg: {
            path: newProfileImg?.path,
            publicUrl: newProfileImg?.publicUrl,
          },
        },
      },
    },
    include: {
      ISPSU_Staff: true,
    },
  });

  return update;
};
export const prismaValidateStaff = async (
  staffId: number,
  validatedValue: boolean,
): Promise<ISPSU_Staff | null> => {
  const validateStaff = await prisma.iSPSU_Staff.update({
    where: {
      staffId: staffId,
    },
    data: {
      validated: validatedValue,
    },
  });
  return validateStaff;
};
