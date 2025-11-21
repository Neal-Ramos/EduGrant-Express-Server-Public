import { Prisma } from "../lib/prisma"


export type prismaGetApplicationByIdScholarshipIdType = Prisma.ApplicationGetPayload<{
    include: {Student: {include: {Account: true}}}
}>