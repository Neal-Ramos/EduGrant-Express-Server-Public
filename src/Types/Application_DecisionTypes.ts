import { Prisma } from "@prisma/client"


export type prismaGetApplicationByIdScholarshipIdType = Prisma.ApplicationGetPayload<{
    include: {Student: {include: {Account: true}}}
}>