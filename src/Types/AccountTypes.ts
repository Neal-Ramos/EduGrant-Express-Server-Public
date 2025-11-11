import { Prisma } from "@prisma/client"


export type AccountRelations = Prisma.AccountGetPayload<{
    include: { ISPSU_Staff: true , ISPSU_Head: true , Student: true}
}>
export type prismaGetAccountByIdType = Prisma.AccountGetPayload<{
    include:{
        ISPSU_Staff:true,
        ISPSU_Head:true,
        Student:{
            include:{
                Application: {
                    include: {Scholarship:true, Interview_Decision: true, Application_Decision: true}
                },
                Account: {select: {email: true, schoolId: true}}
            }
        },
    }
}>
export type prismaUpdateStaffAccountType = Prisma.AccountGetPayload<{
    include:{
        ISPSU_Staff: true,
    }
}>