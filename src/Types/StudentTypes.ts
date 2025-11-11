import { Prisma } from "@prisma/client"


export type AccountWithRelationsType = Prisma.StudentGetPayload<{
    include: {
        Application: {
            include: {
                Scholarship: {
                    include: {
                        Scholarship_Provider: true
                    }
                }
            }
        }, 
        Account: {
            select: {
                role: true, email: true, schoolId: true
            }
        }
    }
}>