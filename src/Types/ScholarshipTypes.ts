import { Prisma } from "@prisma/client"


export type ScholarshipWithChildType = Prisma.ScholarshipGetPayload<{
    include:{
        Application?: true,
        Scholarship_Provider?: true
        ISPSU_Head?: true
    }
}>
export type prismaRenewScholarshipType = Prisma.ScholarshipGetPayload<{
    include:{
        Scholarship_Provider: true,
        Application:{
            include:{
                Student:true
            }
        }
    }
}>