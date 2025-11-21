import { Prisma } from '../lib/prisma';

export type prismaGetStaffAccountsType = Prisma.AccountGetPayload<{
  include: {
    ISPSU_Staff: true;
  };
}>;
export type prismaGetStaffByIdType = Prisma.AccountGetPayload<{
  include: {
    ISPSU_Staff: true;
  };
}>;
