import { Application, Prisma, PrismaClient, Scholarship } from "@prisma/client";
import { ResponseUploadSupabase } from "../Config/Supabase";
import { applicationFilesTypes, DocumentEntry } from "../Types/postControllerTypes";
import { title } from "process";
import { io } from "..";
import { resolve } from "path";

const prisma = new PrismaClient()

type ScholarshipWithChild = Prisma.ScholarshipGetPayload<{
    include:{
        Application?: true,
        Scholarship_Provider?: true
        ISPSU_Head?: true
    }
}>

export const prismaCreateScholarship = async(scholarshipType: string, newScholarTitle: string, newScholarProvider: string,  newScholarDeadline: Date, newScholarDescription: string,
        scholarshipDocuments: DocumentEntry[], scholarshipAmount: string|undefined, scholarshipLimit: number|undefined, gwa: number|undefined, accountId: number, 
        sponsorResult: ResponseUploadSupabase, coverResult: ResponseUploadSupabase, formResult: ResponseUploadSupabase|undefined, isForInterview: string): Promise<Scholarship>=> {
    const newScholarship = await prisma.scholarship.create({
        data: {
            title: newScholarTitle,
            ...(scholarshipAmount? {amount: scholarshipAmount}:undefined),
            ...(gwa? {requiredGWA: gwa}:undefined),
            ...(scholarshipLimit? {limit: scholarshipLimit}:undefined),
            description: newScholarDescription,
            type: scholarshipType,
            cover: coverResult.publicUrl,
            logo: sponsorResult.publicUrl,
            form: formResult?.publicUrl,
            supabasePath: {
                cover:  coverResult.path,
                logo:  sponsorResult.path,
                form:  formResult?.path
            },
            approved: 0,
            declined: 0,
            pending: 0,
            interview: isForInterview === 'true' ? true : false,
            documents: {"phase-1":scholarshipDocuments},
            deadline: newScholarDeadline,
            Scholarship_Provider:{
                create:{
                    name: newScholarProvider,
                }
            },
            ISPSU_Head:{
                connect:{
                    headId: accountId
                }
            }
        },
        include:{
            Scholarship_Provider: true
        }
    });
    return newScholarship;
}
export const prismaGetScholarship = async(page?: number, dataPerPage?: number, sortBy?: string, order?: string, status?: string, 
    filters?: {id: string, value?: string[]}[], accountId?: number, search?: string): Promise<{scholarship: Scholarship[], totalCount: number, countActive: number, countRenew: number, countExpired: number}>=>{
        const allowedSortBy: string[] = ["title", "type", "pending", "approved", "declined", "deadline", "dateCreated"]
        const allowedSortByProvider: string[] = ["name"]
        const allowedStatus: string[] = ["ACTIVE", "ENDED", "EXPIRED", "RENEW"]
        const allowedOrder: string[] = ["asc", "desc"]
        const whereClause: Prisma.ScholarshipWhereInput = {}
        if (status && allowedStatus.includes(status)) {
            if (status === "ENDED") {
                whereClause.ended = true
            } else if (status === "EXPIRED") {
                whereClause.ended = false
                whereClause.deadline = { lt: new Date() }
            } else if (status === "ACTIVE") {
                whereClause.ended = false
                whereClause.deadline = { gt: new Date() }
                whereClause.phase = 1
            } else if(status === "RENEW"){
                whereClause.ended = false
                whereClause.phase = {gt: 1}
                whereClause.Application = accountId? {some:{ownerId: accountId, status: {notIn: ["BLOCKED", "DECLINED"]}}}: undefined
                whereClause.deadline = { gt: new Date()}
            }
        }

        const [scholarship, totalCount, countActive, countRenew, countExpired, countEnded] = await Promise.all([
            prisma.scholarship.findMany({
                ...(dataPerPage? {take: dataPerPage}:undefined),
                ...(page && dataPerPage? {skip: (page-1)*dataPerPage}:undefined),
                orderBy: [
                    ...(allowedSortBy.includes(sortBy || '')
                        ? [{ [sortBy as string]: allowedOrder.includes(order || '') ? order : 'asc' }]
                        : []),
                    ...(allowedSortByProvider.includes(sortBy || '')
                        ? [{ Scholarship_Provider: { [sortBy as string]: allowedOrder.includes(order || '') ? order : 'asc' } }]
                        : []),
                ],
                include:{
                    Scholarship_Provider: true,
                    Application:{
                        where:{
                            ownerId: accountId,
                            status:{not:"RENEW"}
                        },
                        select:{
                            ownerId: true,
                            status: true,
                        }
                    }
                },
                where:{
                    ...whereClause,
                    Scholarship_Provider:{name: {in: filters?.find(f => f.id === "name")?.value}},
                    title: {in: filters?.find(f => f.id === "title")?.value},
                    ...(search? {
                        OR:[
                            {title:{contains: search, mode:"insensitive"}},
                            {Scholarship_Provider:{name:{contains:search, mode: "insensitive"}}}
                        ]
                    }:{})
                }
            }),
            prisma.scholarship.count({
                where: {
                    ...whereClause,
                    Scholarship_Provider:{name: {in: filters?.find(f => f.id === "name")?.value}},
                    title: {in: filters?.find(f => f.id === "title")?.value},
                }
            }),
            prisma.scholarship.count({
                where:{
                    deadline: {gt:new Date()},
                    Scholarship_Provider:{name: {in: filters?.find(f => f.id === "name")?.value}},
                    title: {in: filters?.find(f => f.id === "title")?.value},
                    phase: 1
                }
            }),
            prisma.scholarship.count({
                where: {
                    phase: {gt: 1},
                    deadline: {gt:new Date()},
                    Application:{
                        some: {ownerId: accountId, status: {not:"BLOCKED"}}
                    },
                    Scholarship_Provider:{name: {in: filters?.find(f => f.id === "name")?.value}},
                    title: {in: filters?.find(f => f.id === "title")?.value},
                }
            }),
            prisma.scholarship.count({
                where:{
                    deadline: {lt:new Date()},
                    ended: false,
                    ...(accountId? {
                        Application: {
                            some: {
                                AND:[
                                    {ownerId: accountId},
                                    {status: {
                                        in: ["RENEW", "PENDING", "APPROVED", "INTERVIEW"]
                                    }}
                                ]
                            }
                        }
                    }:{})
                }
            }),
            prisma.scholarship.count({
                where:{
                    ended: true,
                    ...(accountId? {
                        Application: {
                            some: {
                                AND:[
                                    {ownerId: accountId},
                                    {status: {
                                        in: ["RENEW", "PENDING", "APPROVED", "INTERVIEW"]
                                    }}
                                ]
                            }
                        }
                    }:{})
                }
            })
        ])
        return {scholarship, totalCount, countActive, countRenew, countExpired};
}
export const prismaGetRenewScholarship = async(page: number|undefined, dataPerPage: number|undefined, sortBy: string|undefined, order: string|undefined, status: string|undefined, 
    filters: {id: string, value: string}[]|undefined, accountId: number): Promise<{scholarship: Scholarship[], totalCount: number, countActive: number, countRenew: number, countExpired: number}>=>{
        const allowedSortBy: string[] = ["title", "description", "type", "approved", "declined", "interview", "ended", "deadline", "dateCreated"]
        const allowedFilters: string[] = ["title", "amount", "description", "type"]
        const allowedStatus: string[] = ["ACTIVE", "ARCHIVED", "EXPIRED"]
        const allowedOrder: string[] = ["asc", "desc"]
        const whereClause: any = {
            phase: {gt:1},
            Application:{
                some:{
                    ownerId: accountId,
                    status: "APPROVED"
                }
            }
        }
        for(const value of filters || []){
            if(allowedFilters.includes(value.id)){
                whereClause[value.id] = value.value
            }
        }
        if (status && allowedStatus.includes(status)) {
            if (status === "ARCHIVED") {
                whereClause.ended = true
            } else if (status === "EXPIRED") {
                whereClause.deadline = { lt: new Date() }
            } else if (status === "ACTIVE") {
                whereClause.deadline = { gt: new Date() }
            } else if(status === "RENEW"){
                whereClause.OR = []
                whereClause.OR.push({deadline:{ gt: new Date() }})
                whereClause.OR.push({phase: {gt:1}, Application: {some: {ownerId: accountId}}})
            }
        }

        const [scholarship, totalCount, countActive, countRenew, countExpired] = await Promise.all([
            prisma.scholarship.findMany({
                ...(dataPerPage? {take: dataPerPage}:undefined),
                ...(page && dataPerPage? {skip: (page-1)*dataPerPage}:undefined),
                orderBy:[
                    ...(allowedSortBy.includes(sortBy||'')? [{[sortBy as string]: allowedOrder.includes(order||'')? order : 'asc'}] : [])
                ],
                include:{
                    Scholarship_Provider: true
                },
                where:whereClause
            }),
            prisma.scholarship.count({
                where: whereClause
            }),
            prisma.scholarship.count({
                where:{
                    ended: false,
                    deadline: {gt:new Date()},
                    phase: 1
                }
            }),
            prisma.scholarship.count({
                where: {
                    ended: false,
                    phase: {gt: 1},
                    deadline: {gt:new Date()},
                    Application:{
                        some: {ownerId: accountId, status:{not: "BLOCKED"}}
                    }
                }
            }),
            prisma.scholarship.count({
                where:{
                    ended: false,
                    OR:[
                        {deadline: {lt:new Date()}, phase: 1},
                        {phase: {gt:1}, Application: {some: {ownerId: accountId, status:{not: "BLOCKED"}}}}
                    ]
                }
            }),
        ])
        return {scholarship, totalCount, countActive, countRenew, countExpired};
}
export const prismaSearchScholarshipTitle = async(page?: number, dataPerPage?: number, search?: string, 
    sortBy?: string, order?: string, status?: string, ownerId?: number): Promise<{searchResults: Scholarship[], totalCount: number, countActive: number, countRenew: number, countExpired: number}>=>{
    const allowedSortBy: string[] = ["title", "amount", "description", "type", "phase", "dateCreated"]
    const finalOrder: string|undefined = ["asc", "desc"].includes(order || "")? order:"asc"

    const [searchResults, totalCount, countActive, countRenew, countExpired] = await Promise.all([
        prisma.scholarship.findMany({
            take: dataPerPage,
            skip: page && dataPerPage? (page - 1) * dataPerPage:undefined,
            orderBy:[
                ...(allowedSortBy.includes(sortBy || "")? [{[sortBy as string]: finalOrder}]:[])
            ],
            where:{
                ...(status === "ACTIVE"? {
                    ended: false,
                    deadline: {gt:new Date()},
                    phase: 1
                }:{}),
                ...(status === "EXPIRED"? {
                    ended: false,
                    deadline: {lt:new Date()},
                }:{}),
                ...(status === "RENEW"? {
                    ended: false,
                    deadline: {gt:new Date()},
                    phase: {gt: 1},
                    Application: {some: {ownerId: ownerId, status: {not: "BLOCKED"}}}
                }:{}),
                ...(search? {title: {contains:search, mode: "insensitive"}}:{})
            },
            include:{
                Application:{
                    select:{applicationId: true},
                    where:{ownerId:ownerId, status:{not: "RENEW"}}
                }
            }
        }),
        prisma.scholarship.count({
            where:{
                ...(status === "ACTIVE"? {
                    ended: false,
                    deadline: {gt:new Date()},
                    phase: 1
                }:{}),
                ...(status === "EXPIRED"? {
                    ended: false,
                    deadline: {lt:new Date()},
                }:{}),
                ...(status === "RENEW"? {
                    ended: false,
                    deadline: {gt:new Date()},
                    phase: {gt: 1},
                    Application: {some: {ownerId: ownerId, status: {not: "BLOCKED"}}}
                }:{}),
                ...(search? {title: {contains:search, mode: "insensitive"}}:{})
            },
        }),
        prisma.scholarship.count({
            where:{
                ended: false,
                deadline: {gt:new Date()},
                phase: 1
            }
        }),
        prisma.scholarship.count({
            where: {
                ended: false,
                phase: {gt: 1},
                deadline: {gt:new Date()},
                Application:{
                    some: {ownerId: ownerId, status:{not: "BLOCKED"}}
                }
            }
        }),
        prisma.scholarship.count({
            where:{
                ended: false,
                OR:[
                    {deadline: {lt:new Date()}, phase: 1},
                    {phase: {gt:1}, Application: {some: {ownerId: ownerId, status:{not: "BLOCKED"}}}}
                ]
            }
        }),
    ])
    return {searchResults, totalCount, countActive, countRenew, countExpired};
}
export const prismaGetScholarshipsById = async(scholarshipId: number, accountId?: number): Promise<Scholarship | null>=>{
    const scholarship = await prisma.scholarship.findUnique({
        where:{
            scholarshipId: scholarshipId,
            ...(accountId? {ended: false}:{})
        },
        include:{
            Scholarship_Provider: true,
            Application:{
                where:{
                    ownerId:accountId,
                    status:{not: "RENEW"}
                },
                select:{
                    applicationId: true,
                }
            }
        }
    })
    return scholarship;
}
export const prismaUpdateScholarship = async(
    scholarshipId: number,
    newScholarProvider: string,
    newScholarTitle: string,
    newScholarDeadline: Date,
    scholarshipAmount: string | undefined,
    newScholarDescription: string,
    scholarshipDocuments: object,
    scholarshipLimit: number | undefined,
    gwa: number | undefined,
    scholarshipLogo: ResponseUploadSupabase | undefined,
    scholarshipCover: ResponseUploadSupabase | undefined,
    scholarshipForm: ResponseUploadSupabase | undefined,
    newSupabasePath: object
): Promise<Scholarship>=> {
    const updateScholarship = await prisma.scholarship.update({
        where: {
            scholarshipId: scholarshipId
        },
        data: {
            title: newScholarTitle,
            ...(scholarshipAmount? {amount: scholarshipAmount}:undefined),
            ...(gwa? {requiredGWA: gwa}:undefined),
            ...(scholarshipLimit? {limit: scholarshipLimit}:undefined),
            description: newScholarDescription,
            documents: scholarshipDocuments,
            ...(scholarshipLogo? {logo: scholarshipLogo.publicUrl}:undefined),
            ...(scholarshipCover? {cover: scholarshipCover.publicUrl}:undefined),
            ...(scholarshipForm? {form: scholarshipForm.publicUrl}:undefined),
            supabasePath: newSupabasePath,
            deadline: newScholarDeadline,
            Scholarship_Provider: {
                update: {
                    name: newScholarProvider
                }
            }
        },
        include:{
            Scholarship_Provider: true,
            Application:{

            }
        }
    })
    return updateScholarship;
}
type prismaRenewScholarship = Prisma.ScholarshipGetPayload<{
    include:{
        Scholarship_Provider: true,
        Application:{
            include:{
                Student:true
            }
        }
    }
}>
export const prismaRenewScholarship = async(accountId: number, scholarshipId: number, updatedRequirements: object, renewDeadline: Date, isForInterview: "false"|"true")
: Promise<prismaRenewScholarship | null>=>{
    const transac = await prisma.$transaction(async(tx)=> {
        const scholar = await tx.scholarship.update({
            where: {
            scholarshipId: scholarshipId
            },
            data: {
                interview: isForInterview === 'true' ? true : false,
                documents: updatedRequirements,
                phase: {increment: 1},
                deadline: renewDeadline,
                pending: 0,
                declined: 0,
                approved: 0,
                Application: {
                    updateMany:{
                        where: {
                            status: "APPROVED"
                        },
                        data:{
                            status: "RENEW",
                        }
                    }
                }
            },
            include: {
                Scholarship_Provider: true,
                Application:{
                    where:{
                        scholarshipId: scholarshipId,
                        status: "RENEW"
                    },
                    include: {
                        Student: true
                    }
                }
            }
        })
        await tx.application.updateMany({
            where:{
                scholarshipId: scholar.scholarshipId,
                status: {not: "RENEW"}
            },
            data:{
                status: "BLOCKED"
            },
        })
        return scholar
    })//Renew Scholarship And Process the Applications

    let lastId: undefined|number = undefined
    while(true){// Create Bulk Notifications for Renew Applications
        const applicationRecords: {
            ownerId: number;
            applicationId: number;
            scholarshipId: number;
            status: string,
            Scholarship: { title: string }|null;
        }[] = await prisma.application.findMany({
            where:{
                status: "RENEW"
            },
            select:{
                ownerId: true,
                applicationId: true,
                scholarshipId: true,
                status: true,
                Scholarship: {select: {title: true}}
            },
            orderBy: [{applicationId: "asc"}],
            take: 2000,
            ...(lastId? {cursor: {applicationId: lastId}, skip: 1}:{})
        })
        if(applicationRecords.length === 0) break

        const BulkCreateNotifications: Prisma.Student_NotificationCreateManyInput[] = applicationRecords.map(app => ({
                ownerId: app.ownerId,
                title: "RENEWAL ELIGIBLE",
                status:"RENEW",
                description: `Your scholarship application is now eligible for renewal. Please review your information and submit the renewal requirements before the deadline to continue your scholarship benefits.`,
                applicationId: app.applicationId,
                scholarshipId: app.scholarshipId
        }))
        await prisma.student_Notification.createMany({
            data: BulkCreateNotifications
        })
        if(BulkCreateNotifications.length < 2000) break
        io.to(applicationRecords.map(e => e.ownerId.toString())).emit("RENEW", {notification: 1})
        lastId = applicationRecords[applicationRecords.length-1].applicationId
    }
    return transac;
}
export const prismaDeleteScholarship = async(scholarshipId: number): Promise<number>=>{
    const transac = await prisma.$transaction(async(tx)=> {
        const deletedScholarship = await tx.scholarship.deleteMany({
            where:{
                scholarshipId: scholarshipId
            }
        })
        return deletedScholarship
    })
    return transac.count;
}
export const prismaGetScholarshipByArray = async (scholarshipId: number): Promise<ScholarshipWithChild | null> => {
    return prisma.scholarship.findUnique({
        where: {
            scholarshipId: scholarshipId
        },
        include:{
            ISPSU_Head: true,
            Scholarship_Provider: true,
            Application: true
        }
    })
}
export const prismaFiltersScholarship = async(status: string|undefined): Promise<{}>=>{
    const FilterScholar = ["ACTIVE", "EXPIRED"]
    const filterScholarship = await prisma.scholarship.findMany({
        where:{
            ...(FilterScholar.includes(status||'')? (status ==="ACTIVE"? {deadline:{gt:new Date()}}:{deadline:{lt:new Date()}}):undefined),
            ...(status === "ARCHIVED"? {ended:true}:undefined),
            ...(status === "RENEW"? {phase:{gt:1}}:undefined),
        },
        distinct: ['title', 'phase'],
        select:{
            title: true,
            phase: true,
        }
    })
    const provider = await prisma.scholarship_Provider.findMany({
        where: {
            Scholarship: {
                ...(FilterScholar.includes(status||'')? (status ==="ACTIVE"? {deadline:{gt:new Date()}, phase: 1}:{deadline:{lt:new Date()}, phase: 1}):undefined),
                ...(status === "ARCHIVED"? {ended:true}:undefined),
                ...(status === "RENEW"? {phase:{gt:1}}:undefined),
            }
        },
        distinct:['name'],
        select:{
            name: true
        }
    })
    return {scholarship: [...new Set(filterScholarship.map(e => e.title))], phase: [...new Set(filterScholarship.map(e => e.phase))], provider: provider.map(e => e.name)};
}
export const prismaGetScholarshipDocuments = async (scholarshipId: number): Promise<{}|null>=>{
    const documents = await prisma.scholarship.findFirst({
        where:{
            scholarshipId: scholarshipId
        },
        select:{
            documents: true
        }
    })
    return documents
}
export const prismaEndScholarship = async(scholarshipId: number): Promise<{endedScholarship: Scholarship|null, endenApplications: Application[]}>=>{
    const [endedScholarship, endenApplications] = await Promise.all([
        prisma.scholarship.update({
            where:{
                scholarshipId: scholarshipId
            },
            data:{
                ended: true,
                dateEnded:new Date()
            },
            include:{
                Scholarship_Provider: true,
            }
        }),
        prisma.application.findMany({
            where:{
                scholarshipId:scholarshipId
            },
            include:{
                Scholarship:{
                    include:{
                        Scholarship_Provider: true
                    }
                },
                Student:{
                    include:{
                        Account:{
                            select:{
                                email: true,
                                schoolId: true
                            }
                        }
                    }
                },
                Interview_Decision: true,
                Application_Decision: true
            }
        })
    ])
    return {endedScholarship, endenApplications}
}
export const prismaStudentCountsInToken = async(accountId?: number): 
Promise<{availableScholarshipCount: number, applicationCount: number, announcementCount: number, ISPSU_StaffCount: number, applicationCountPerStatus: Record<string, number>[]}>=>{
    const [availableScholarshipCount, applicationCount, announcementCount, ISPSU_StaffCount, applicationGroupStatusCount] = await Promise.all([
        prisma.scholarship.count({
            where:{
                deadline: {gt: new Date()},
                OR:[
                    {phase: 1},
                    {
                        AND:[
                            {phase: {gt: 1}},
                            {...(accountId? {Application: {some: {ownerId: accountId}}}:{})}
                        ]
                    }
                ]
            }
        }),
        prisma.application.count({
            where:{
                ...(accountId? {ownerId: accountId}:{})
            }
        }),
        prisma.announcement.count({
            
        }),
        prisma.iSPSU_Staff.count({

        }),
        prisma.application.groupBy({
            by:["status"],
            where:{
                ownerId: accountId
            },
            _count:{
                status: true
            }
        })
    ])
    const applicationCountPerStatus: Record<string, number>[] = []
    applicationGroupStatusCount.forEach(e => applicationCountPerStatus.push({[e.status]: e._count.status}))

    return {availableScholarshipCount, applicationCount, announcementCount, ISPSU_StaffCount, applicationCountPerStatus}
}