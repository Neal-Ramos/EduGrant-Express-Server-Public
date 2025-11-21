import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  PrismaClient,
  Prisma,
  ISPSU_Head,
  Application_Decision,
  Auth_Code,
  Interview_Decision,
  ISPSU_Staff,
  Scholarship,
  Scholarship_Provider,
  Staff_Logs,
  Student,
  Student_Notification,
} from '../../generated/prisma/client';
import { Account, Announcement, Application } from '../../generated/prisma/client';

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export { prisma, Prisma };
export type {
  Account,
  ISPSU_Head,
  ISPSU_Staff,
  Student,
  Auth_Code,
  Scholarship_Provider,
  Scholarship,
  Application,
  Application_Decision,
  Interview_Decision,
  Staff_Logs,
  Student_Notification,
  Announcement,
};
