import { Application, Prisma, PrismaClient, Student_Notification } from "@prisma/client";
import { RecordApplicationFilesTypes } from "../Types/postControllerTypes";
import { prismaCreateStaffLog } from "./Staff_LogsModels";

const prisma = new PrismaClient();

type ApplicationWithRelation = Prisma.ApplicationGetPayload<{
    include:{Student: true, Scholarship: true}
}>

type ApplicationWithStudentAndScholarship = Prisma.ApplicationGetPayload<{
    include: { Student: true , Scholarship: true }
}>
type prismaGetApplication = Prisma.ApplicationGetPayload<{
    include:{Student: {include:{Account: {select:{accountId: true, schoolId: true, email: true, role: true}}}}, Scholarship: true, Application_Decision:true, Interview_Decision: true}
}>
export const prismaGetApplication = async (applicationId: number): Promise<prismaGetApplication | null> => {
    const application = await prisma.application.findUnique({
        where: { applicationId: applicationId },
        include:{
            Student:{
                include:{
                    Account:{
                        select:{
                            accountId: true,
                            schoolId: true,
                            email: true,
                            role: true
                        }
                    }
                }
            },
            Scholarship:true,
            Application_Decision: {include:{ISPSU_Staff:true}},
            Interview_Decision: {include:{ISPSU_Staff:true}}
        }
    });
    return application;
}
export const prismaGetAllApplication = async (status?: string, page?: number, dataPerPage?: number, sortBy?: string, 
    order?: string, filter?: Array<{id:string, value:string[]}>, scholarshipId?: number, applicationId?:number)
    : Promise<{applications: Application[], applicationsCount: number, countsByStatus: Record<string, number>}> => {
    const allowedSortBy: string|undefined = ["status", "dateCreated", "processedDate"].includes(sortBy as string)? sortBy:undefined
    const allowedSortByStudent: string|undefined = ["fName", "lName", "mName", "indigenous", "PWD", "institute", "course", "year", "section"].includes(sortBy as string)? sortBy:undefined
    const allowedSortByScholarship: string|undefined = ["title", "amount", "description", "type", "requiredGWA", "limit", "phase", "deadline", "dateCreated"].includes(sortBy as string)? sortBy:undefined
    const allowedSortByDecision: string|undefined = ["processedDate"].includes(sortBy as string)? sortBy:undefined
    const finalOrder: string = ["asc", "desc"].includes(order as string)? order as string:"asc"

    const [applications, applicationsCount, rawStatusCounts] = await Promise.all([
        prisma.application.findMany({
            ...(dataPerPage? { take: dataPerPage } : undefined),
            ...(dataPerPage && page ? { skip: (page - 1) * dataPerPage, take: dataPerPage } : undefined),
            where:{
                applicationId: applicationId,
                status: status,
                scholarshipId: scholarshipId,
                Student: {
                    year: {in:filter?.find(f => f.id === "year")?.value},
                    section: {in:filter?.find(f => f.id === "section")?.value},
                    institute: {in:filter?.find(f => f.id === "institute")?.value},
                },
                Scholarship:{
                    title: {in: filter?.find(f => f.id === "title")?.value}
                }
            },
            orderBy:{
                ...(allowedSortBy? {[allowedSortBy]:finalOrder}:{}),
                ...(allowedSortByStudent? {Student:{[allowedSortByStudent]:finalOrder}}:{}),
                ...(allowedSortByScholarship? {Scholarship:{[allowedSortByScholarship]:finalOrder}}:{}),
                ...(allowedSortByDecision? {Application_Decision:{[allowedSortByDecision]:finalOrder}}:{}),
            },
            include:{ Student:{include:{Account:{select:{accountId: true, schoolId: true,email: true,role: true}}, Application: {select:{applicationId: true}}}}, Scholarship:{include:{Scholarship_Provider: true, ISPSU_Head: true}}, Application_Decision: true, Interview_Decision: true }
        }),
        prisma.application.count({
            where:{
                applicationId: applicationId,
                status: status,
                scholarshipId: scholarshipId,
                Student: {
                    year: {in:filter?.find(f => f.id === "year")?.value},
                    section: {in:filter?.find(f => f.id === "section")?.value},
                    institute: {in:filter?.find(f => f.id === "institute")?.value},
                }
            },
        }),
        prisma.application.groupBy({
            by:["status"],
            where:{
                applicationId: applicationId,
                scholarshipId: scholarshipId,
                Student: {
                    year: {in:filter?.find(f => f.id === "year")?.value},
                    section: {in:filter?.find(f => f.id === "section")?.value},
                    institute: {in:filter?.find(f => f.id === "institute")?.value},
                }
            },
            _count:{status: true}
        })
    ])
    const countsByStatus: Record<string, number> = {}
    rawStatusCounts.forEach(e => {
        countsByStatus[e.status] = e._count.status
    })

    return {applications, applicationsCount, countsByStatus};
}
export const prismaGetAllAccountApplication = async (
    accountId: number, page?: number, dataPerPage?: number, 
    status?:string, search?: string, order?: string, sortBy?: string
)
: Promise<{applications: Application[], totalCount: number, counts: Record<string, number>}> => {
    const allowedSortBy:string|undefined = ["status","dateCreated"].find(f => f === sortBy)
    const finalOrder:string|undefined = ["asc", "desc"].find(f => f === order) 

    const [applications, totalCount, rawCounts] = await Promise.all([
        prisma.application.findMany({
            ...(dataPerPage? { take: dataPerPage } : undefined),
            ...(dataPerPage && page ? { skip: (page - 1) * dataPerPage, take: dataPerPage } : undefined),
            where:{
                ownerId: accountId,
                status: status,
                ...(search? {Scholarship:{
                    OR:[
                        {title: {contains: search, mode:"insensitive"}},
                        {Scholarship_Provider: {
                            name: {contains: search, mode:"insensitive"}
                        }}
                    ]
                }}:{})
            },
            ...(allowedSortBy? {orderBy:{[allowedSortBy]:finalOrder||"asc"}}:{})
            ,
            include:{ Student:{include:{Account:{select:{accountId: true, schoolId: true,email: true,role: true}}}}, Scholarship:{include:{Scholarship_Provider: true, ISPSU_Head: true}}, Application_Decision: true, Interview_Decision: true }
        }),
        prisma.application.count({
            where:{
                ownerId: accountId,
                status: status,
                ...(search? {Scholarship:{
                    OR:[
                        {title: {contains: search, mode:"insensitive"}},
                        {Scholarship_Provider: {
                            name: {contains: search, mode:"insensitive"}
                        }}
                    ]
                }}:{})
            },
        }),
        prisma.application.groupBy({
            by:["status"],
            where:{
                ownerId: accountId,
            },
            _count:{
                status:true
            },
        })
    ])
    const counts: Record<string, number> = {}
    rawCounts.forEach(e => {
        counts[e.status] = e._count.status
    })
    
    return {applications, totalCount, counts}
}
export const prismaSearchApplication = async(search?: string, status?: string, sortBy?: string, order?: string, 
    page?: number, dataPerPage?: number, ownerId?: number): Promise<{applications: Application[], totalCount:number}> => {
        const allowedStatusFilter = ["DECLINED", "PENDING", "APPROVED", "INTERVIEW"]
        const allowedSortBy = ["studentId", "status"]

        const transac = await prisma.$transaction(async (tx) => {
            const applications = await tx.application.findMany({
                ...(dataPerPage? { take: dataPerPage } : undefined),
                ...(dataPerPage && page ? { skip: (page - 1) * dataPerPage, take: dataPerPage } : undefined),
                orderBy:[
                    ...(allowedSortBy.includes(sortBy || "") ? [{ [sortBy as string]: order === "desc" ? "desc" : "asc" }] : [])
                ],
                where: {
                    ownerId: ownerId,
                    ...(allowedStatusFilter.includes(status||'') ? { status: status } : undefined),
                    OR: [
                        {Student:{fName:{contains:search, mode: 'insensitive'}}},
                        {Student:{lName:{contains:search, mode: 'insensitive'}}},
                        {Student:{mName:{contains:search, mode: 'insensitive'}}},
                        {Student:{Account: {schoolId: {contains: search, mode: "insensitive"}}}},
                        {Student:{Account: {email: {contains: search, mode: "insensitive"}}}},
                    ]
                },
                include:{
                    Student:{
                        include:{
                            Account:{
                                select:{
                                    accountId: true,
                                    schoolId: true,
                                    email: true,
                                    role: true
                                }
                            }
                        }
                    },
                    Scholarship:{
                        include:{
                            Scholarship_Provider: true
                        }
                    },
                    Application_Decision: true,
                    Interview_Decision: true
                }
            });
            const totalCount = await tx.application.count({
                where: {
                    ...(allowedStatusFilter.includes(status||'') ? { status: status } : undefined),
                    OR: [
                        {Student:{fName:{contains:search, mode: 'insensitive'}}},
                        {Student:{lName:{contains:search, mode: 'insensitive'}}},
                        {Student:{mName:{contains:search, mode: 'insensitive'}}},
                    ]
                }
            })
            return {applications, totalCount}
        })
        return transac;
}
type ApplicationWithScholarship = Prisma.ApplicationGetPayload<{include: {Scholarship: true}}>
export const prismaCheckApproveGov = async(accountId: number): Promise<ApplicationWithScholarship|null> => {
    const applications = await prisma.application.findFirst({
        where:{
            ownerId: accountId,
            status: "APPROVED",
            Scholarship:{
                type: "government",
                ended: false
            }
        },
        include:{
            Scholarship: true
        }
    });
    return applications;
}
export const prismaDeleteApplication = async(applicationIds: number[]): Promise<number[]> => {
    const transac = await prisma.$transaction(async (tx) => {
        const applications = await tx.application.findMany({
            where: {
                applicationId: { in: applicationIds }
            },
            select:{
                applicationId: true,
                scholarshipId: true,
                status: true
            }
        });
        const deleteResult = await tx.application.deleteMany({
            where: {
                applicationId: { in: applicationIds }
            }
        });
        if(deleteResult.count === 0){
            return applications
        }
        const scholarshipRecords: Record<string, {id: number,count:number, status: string}> = {};
        for (const app of applications) {
            const key = `${app.scholarshipId}-${app.status}`;
            if(!scholarshipRecords[key]){
                scholarshipRecords[key] = {id: app.scholarshipId || 0, count:1, status: app.status}
            }else{
                scholarshipRecords[key].count++;
            }
        }
        await Promise.all(
            Object.values(scholarshipRecords).map((rec) =>
                tx.scholarship.update({
                where: { scholarshipId: rec.id },
                data: {
                    pending: ["PENDING", "INTERVIEW"].includes(rec.status) ? { decrement: rec.count } : undefined,
                    declined: rec.status === "DECLINED" ? { decrement: rec.count } : undefined,
                    approved: rec.status === "APPROVED" ? { decrement: rec.count } : undefined
                }
                })
            )
        )
        return applications
    })
    return transac.map(i => i.applicationId);
}
export const prismaGetApplicationPath = async(applicationId: number[]): Promise<Array<{}>>=>{
    const applicationPath = await prisma.application.findMany({
        where:{
            applicationId: {in: applicationId},
        },
        select:{
            supabasePath: true
        }
    });
    return applicationPath;
}
export const prismaApproveApplication = async (applicationId: number,accountId: number, rejectMessage: {}, scholarshipPhase: number): 
Promise<{Application: Application, BlockedApplications: Application[], notification: Student_Notification}> => {
    const transac  = await prisma.$transaction(async (tx) => {
        const approveApplication = await tx.application.update({
            where:{
                applicationId: applicationId
            },
            data:{
                status: "APPROVED",
                Scholarship:{update:{approved:{ increment:1}, pending:{ decrement:1}}},
                Application_Decision:{
                    create:{
                        staffId: accountId,
                        status: "APPROVED",
                        message: rejectMessage,
                        scholarshipPhase: scholarshipPhase
                    }
                }
            },
            include:{
                Student: true,
                Scholarship: true,
                Application_Decision: {include: {ISPSU_Staff: {select: {fName: true, mName: true, lName: true}}}},
            }
        })
        const [notification] = await Promise.all([
            tx.student_Notification.create({
                data:{
                    ownerId: approveApplication.ownerId,
                    status:"APPROVED",
                    title:"Application Approved",
                    description:`Congratulations! Your scholarship application has been reviewed and approved. You’ll receive further instructions soon regarding the next steps.`,
                    applicationId: approveApplication.applicationId,
                    scholarshipId: approveApplication.scholarshipId
                },
            }),
            tx.staff_Logs.create({
                data:{
                    staffId:accountId,
                    scholarshipId:approveApplication.scholarshipId,
                    applicationId:applicationId,
                    action:"APPROVED",
                    description:"",
                }
            })
        ])
        if(approveApplication.Scholarship?.type === "private"){
            return {approveApplication, notification};
        }
        // Block Other Gov Applications
        const groupGovApplications = await tx.application.groupBy({
            by:['scholarshipId', 'status'],
            where:{
                ownerId: approveApplication.ownerId,
                status: {in: ["INTERVIEW","PENDING", "RENEW"]},
                Scholarship:{
                    type: "government"
                }
            },
            _count:{applicationId: true}
        })
        await Promise.all(groupGovApplications.map(async (e)=> {
            tx.scholarship.update({
                where:{
                    scholarshipId: e.scholarshipId
                },
                data:{
                    pending: e.status === "PENDING" || e.status === "REVIEWED"? {decrement:e._count.applicationId}: undefined,
                    declined: e.status === "DECLINED"? {decrement:e._count.applicationId}: undefined,
                    approved: e.status === "APPROVED"? {decrement:e._count.applicationId}: undefined,
                }
            })
        }))

        await tx.application.updateMany({
            where:{
                ownerId: approveApplication.ownerId,
                status: {in: ["INTERVIEW","PENDING", "RENEW"]},
                Scholarship:{
                    type: "government"
                }
            },
            data:{
                status: "BLOCKED"
            }
        })
        return {approveApplication, notification};
    })
    // create notifications for blocked applications
    const BlockedApplications = await prisma.application.findMany({
        where:{status: "BLOCKED"},
        include:{
            Scholarship: {
                include:{
                    Scholarship_Provider:true
                }
            },
            Student:{
                include:{
                    Account:{
                        select:{
                            email:true,
                            schoolId:true
                        }
                    }
                }
            },
            Interview_Decision:true,
            Application_Decision:true,
        }
    })
    const queryForCreateMany: Prisma.Student_NotificationCreateManyInput[] = []
    for(const value of (BlockedApplications)){
        queryForCreateMany.push({
            ownerId:transac.approveApplication.ownerId,
            title:"Application Blocked",
            status:"BLOCKED",
            description:`Your scholarship application has been blocked due to a policy or eligibility issue. Please contact the scholarship office or review your submitted details for more information.`,
            applicationId: value.applicationId,
            scholarshipId: value.scholarshipId
        })
    }
    if(queryForCreateMany.length > 0){
        await prisma.student_Notification.createMany({
            data:queryForCreateMany,
            skipDuplicates: true
        })
    }
    
    return {Application: transac.approveApplication, BlockedApplications, notification: transac.notification};
}
export const prismaAcceptForInterview = async (applicationId: number,accountId: number, rejectMessage: {}, scholarshipPhase: number): 
Promise<{interviewApplication: Application, notification: Student_Notification}> => {
    const transac = await prisma.$transaction(async(tx)=> {
        const interviewApplication = await tx.application.update({
            where:{
                applicationId: applicationId
            },
            data:{
                status: "INTERVIEW",
                Interview_Decision:{
                    create:{
                        staffId: accountId,
                        status: "APPROVE",
                        message: rejectMessage,
                        scholarshipPhase: scholarshipPhase
                    },
                }
            },
            include:{
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
                Scholarship:{
                    include:{
                        Scholarship_Provider: {
                            select:{
                                name:true
                            }
                        }
                    }
                },
                Interview_Decision: {
                    include:{
                        ISPSU_Staff:{
                            include:{
                                Account:{
                                    select:{
                                        email:true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })
        const [notification] = await Promise.all([
            tx.student_Notification.create({
                data:{
                    ownerId: interviewApplication.ownerId,
                    title:"Accepted for Interview",
                    status: "INTERVIEW",
                    description:`Great news! You’ve been shortlisted for an interview. Please check your email or dashboard for the schedule and interview details.`,
                    applicationId: interviewApplication.applicationId,
                    scholarshipId: interviewApplication.scholarshipId
                }
            }),
            tx.staff_Logs.create({
                data:{
                    staffId:accountId,
                    scholarshipId:interviewApplication.scholarshipId,
                    applicationId:interviewApplication.applicationId,
                    action:"INTERVIEW",
                    description:"",
                }
            })
        ])
        return {interviewApplication, notification}
    })
    
    return transac;
}
export const prismaDeclineApplication = async(applicationId: number, accountId: number, rejectMessage: {}, scholarshipPhase: number): 
Promise<{declineApplication: ApplicationWithStudentAndScholarship, notification: Student_Notification}> => {
    const transac = await prisma.$transaction(async (tx) => {
        const declineApplication = await tx.application.update({
            where:{
                applicationId: applicationId
            },
            data:{
                status: "DECLINED",
                Application_Decision:{
                    create:{
                        staffId: accountId,
                        status: "DECLINED",
                        message: rejectMessage,
                        scholarshipPhase: scholarshipPhase
                    }
                },
                Scholarship:{
                    update:{
                        declined:{
                            increment:1
                        },
                        pending:{
                            decrement:1
                        }
                    }
                }
            },
            include:{
                Student:{
                    include:{
                        Account:{
                            select:{
                                email:true,
                                schoolId:true
                            }
                        }
                    }
                },
                Scholarship:{include: {Scholarship_Provider: {select:{name:true}}}},
                Application_Decision: true
            }
        })
        const [notification] = await Promise.all([
            tx.student_Notification.create({
                data:{
                    ownerId: declineApplication.ownerId,
                    title:"Application Declined",
                    status:"DECLINED",
                    description:`We appreciate your effort in applying. Unfortunately, your scholarship application was not selected this time. You may apply again in future opportunities.`,
                    applicationId: declineApplication.applicationId,
                    scholarshipId: declineApplication.scholarshipId

                }
            }),
            tx.scholarship.update({
                where:{
                    scholarshipId: declineApplication.scholarshipId || 0
                },
                data:{
                    declined:{
                        increment:1
                    },
                    pending:{
                        decrement:1
                    }
                }
            }),
            tx.staff_Logs.create({
                data:{
                    staffId:accountId,
                    scholarshipId:declineApplication.scholarshipId,
                    applicationId:declineApplication.applicationId,
                    action:"DECLINE",
                    description:"",
                }
            })
        ])
        return {declineApplication, notification};
    })
    
    return transac;
}
export const prismaCheckApplicationDuplicate = async(accountId: number, scholarshipId: number): Promise<Application | null> => {
    const applicationDuplicate = await prisma.application.findFirst({
        where:{
            ownerId: accountId,
            scholarshipId: scholarshipId,
            status:"RENEW"
        }
    });
    return applicationDuplicate;
}
type prismaCreateApplication = Prisma.ApplicationGetPayload<{
    include:{
        Student: {
            include:{
                Account: {
                    select:{
                        email: true,
                        schoolId: true
                    }
                }
            }
        },
        Scholarship: {
            include:{
                Scholarship_Provider: {
                    select:{
                        name: true
                    }
                },
                Application:{
                    select:{applicationId: true}
                }
            }
        },
        Interview_Decision: true,
        Application_Decision: true
    }
}>
export const prismaCreateApplication = async (fileRequirements: RecordApplicationFilesTypes, supabasePath: string[], accountId: number, scholarshipId: number): 
Promise<prismaCreateApplication> => {
    const transac = await prisma.$transaction( async(tx) => {
        const application = await tx.application.create({
            data:{
                ownerId:accountId,
                scholarshipId:scholarshipId,
                supabasePath: supabasePath,
                submittedDocuments: fileRequirements,
            },
            include:{
                Student: {
                    include:{
                        Account: {
                            select:{
                                email: true,
                                schoolId: true
                            }
                        }
                    }
                },
                Scholarship: {
                    include:{
                        Scholarship_Provider: {
                            select:{
                                name: true
                            }
                        },
                        Application:{
                            where:{ownerId: accountId},
                            select:{applicationId: true}
                        }
                    }
                },
                Interview_Decision: true,
                Application_Decision: true
            }
        });
        await tx.scholarship.update({
            where:{
                scholarshipId: scholarshipId
            },
            data:{
                pending:{
                    increment:1
                }
            }
        })
        return application
    })
    return transac;
}
export const prismaUpdateApplicationSubmittedFiles = async(applicationId: number, accountId: number, scholarshipId: number, fileRequirements: RecordApplicationFilesTypes, allApplicationPaths: string[]): Promise<Application|null>=> {
    const result = await prisma.application.update({
        where:{
            applicationId: applicationId,
            ownerId: accountId,
            scholarshipId: scholarshipId
        },
        data:{
            submittedDocuments:fileRequirements,
            supabasePath:allApplicationPaths
        },
        include:{
            Scholarship:{
                include:{Scholarship_Provider:true}
            },
            Student:{
                include:{
                    Account:{select:{
                        email:true,
                        schoolId:true
                    }}
                }
            },
            Application_Decision:true,
            Interview_Decision:true
        }
    })
    return result
}
export const prismaBlockApplicationByOwnerId = async(ownerId: number): Promise<number> => {
    const otherGovApplications = await prisma.application.findMany({
        where:{
            ownerId: ownerId,
            status: {not: "APPROVED"},
            Scholarship:{
                type: "government"
            }
        },
    })
    const records:{[key: string]: {id: number, count: number, status: string}} = {}
    otherGovApplications.forEach((e) => {
        const key: string = `${e.scholarshipId}-${e.status}`;
        if(!records[key]){
            records[key] = {id: e.scholarshipId || 0, count:1, status: e.status}
        }
        else{
            records[key].count++;
        }
    })
    await Promise.all(Object.values(records).map(async (e)=> {
        await prisma.scholarship.update({
            where:{
                scholarshipId: e.id
            },
            data:{
                pending: e.status === "PENDING" || e.status === "REVIEWED"? {decrement:e.count}: undefined,
                declined: e.status === "DECLINED"? {decrement:e.count}: undefined,
                approved: e.status === "APPROVED"? {decrement:e.count}: undefined,
            }
        })
    }))
    const result = await prisma.application.updateMany({
        where:{
            ownerId: ownerId,
            status: {not: "APPROVED"},
            Scholarship:{
                type: "government"
            }
        },
        data:{
            status: "BLOCKED"
        }
    })
    return result.count
}
export const prismaRenewApplication = async( applicationId: number, renewFiles: RecordApplicationFilesTypes, supabasePath: string[]): Promise<number>=> {
    const result = await prisma.application.update({
        where:{
            applicationId: applicationId
        },
        data:{
            status: "PENDING",
            supabasePath: supabasePath,
            submittedDocuments: renewFiles,
            Scholarship: {
                update:{
                    pending: {increment: 1}
                }
            }
        },
        include:{
            Student: {
                include:{
                    Account: {
                        select:{
                            email: true,
                            schoolId: true
                        }
                    }
                }
            },
            Scholarship:{
                include:{
                    Scholarship_Provider:{
                        select:{
                            name:true
                        }
                    }
                }
            }
        }
    })
    return result.ownerId
}
export const prismaBlockApplicationByApplicationId = async(applicationId: number):Promise<Application|null>=> {
    const block = await prisma.application.update({
        where:{applicationId: applicationId},
        data:{
            status: "BLOCKED",
            Scholarship:{
                update:{
                    pending: {decrement: 1}
                }
            }
        }
    })
    return block
}
export const prismaGetFiltersForApplicationsCSV = async (
    scholarship?: string[], applicationStatus?: string[], studentInstitute?: string[], studentCourse?: string[], studentYear?: string[], studentSection?: string[]
): Promise<{}> => {
  const [scholarshipTitles, applicationStatuses, institutes, courses, years, sections] = await Promise.all([
    prisma.scholarship.findMany({
      distinct: ['title'],
      select: { title: true },
    }),
    applicationStatus? prisma.application.groupBy({
        by:["status"],
        _count:{
            _all: true
        },
        where:{
            status: {in: applicationStatus},
            Scholarship:{title: {in: scholarship}}
        }
    }):[],
    studentInstitute? prisma.student.groupBy({
        by:["institute"],
        _count:{
            _all: true
        },
        where:{
            institute: {in: studentInstitute},
            Application: {some:{Scholarship: {title:{in: scholarship}}, status: {in: applicationStatus}}}
        }
    }):[],
    studentCourse? prisma.student.groupBy({
        by:["course"],
        _count:{
            _all: true
        },
        where:{
            course: {in: studentCourse},
            institute: {in: studentInstitute},
            Application: {some:{Scholarship: {title:{in: scholarship}}, status: {in: applicationStatus}}}
        }
    }):[],
    studentYear? prisma.student.groupBy({
        by:["year"],
        _count:{
            _all: true
        },
        where:{
            year: {in: studentYear},
            course: {in: studentCourse},
            institute: {in: studentInstitute},
            Application: {some:{Scholarship: {title:{in: scholarship}}, status: {in: applicationStatus}}}
        }
    }):[],
    studentSection? prisma.student.groupBy({
        by:["section"],
        _count:{
            _all: true
        },
        where:{
            section: {in: studentSection},
            year: {in: studentYear},
            course: {in: studentCourse},
            institute: {in: studentInstitute},
            Application: {some:{Scholarship: {title:{in: scholarship}}, status: {in: applicationStatus}}}
        }
    }):[],
  ]);

  return {
    scholarshipTitles: scholarshipTitles,
    applicationStatuses: applicationStatuses.length? applicationStatuses:[],
    institutes: institutes.length? institutes:[],
    courses: courses.length? courses:[],
    years: years.length? years:[],
    sections: sections.length? sections:[],
  }
};
export const prismaGetApplicationsCSV = async(dataSelections: string[], filters?: {id: string, value: string[]}[]): Promise<object[]> =>{
    const records = await prisma.application.findMany({
        where:{
            Scholarship:{title: {in: (filters?.find(f => f.id == "title")?.value)}},
            Student:{
                course: {in:(filters?.find(f => f.id == "course")?.value)},
                year: {in:(filters?.find(f => f.id == "year")?.value)},
                section: {in:(filters?.find(f => f.id == "section")?.value)},
                institute: {in:(filters?.find(f => f.id == "institute")?.value)},
                gender: {in:(filters?.find(f => f.id == "gender")?.value)}
            },
            status:{in: filters?.find(f => f.id === "status")?.value}
        },
        select: {
            applicationId: true,
            status: dataSelections.includes("status"),
            Scholarship: {
                select: {
                    scholarshipId: true,
                    title:true,
                    Scholarship_Provider: {
                        select:{
                            SPId: true,
                            name:dataSelections.includes("name"),
                        }
                    }
                }
            },
            Student: {
                select: {
                    studentId: true,
                    fName: dataSelections.includes("fName"),
                    lName: dataSelections.includes("lName"),
                    mName: dataSelections.includes("mName"),
                    contactNumber: dataSelections.includes("contactNumber"),
                    gender: dataSelections.includes("gender"),
                    address: dataSelections.includes("address"),
                    indigenous: dataSelections.includes("indigenous"),
                    PWD: dataSelections.includes("PWD"),
                    institute: dataSelections.includes("institute"),
                    course: dataSelections.includes("course"),
                    year: dataSelections.includes("year"),
                    section: dataSelections.includes("section"),
                    dateOfBirth: dataSelections.includes("dateOfBirth"),
                    Account:{
                        select: {
                            accountId: true,
                            schoolId: dataSelections.includes("schoolId"),
                            email: dataSelections.includes("email")
                        }
                    }
                }
            }
        }
    })
    const clean = (obj: Record<string, any>) => Object.fromEntries(Object.entries(obj).filter(([_, v]) => v != null));
    const CSV = records.map(r => clean({
            ["Scholarship Title"]: r.Scholarship?.title,
            ["Scholarship Provider"]:r.Scholarship?.Scholarship_Provider?.name,
            schoolId: r.Student.Account.schoolId,
            email: r.Student.Account.email,
            ["First Name"]: r.Student.fName,
            ["Last Name"]: r.Student.lName,
            ["Middle Name"]: r.Student.mName,
            ["Contact Number"]: r.Student.contactNumber,
            Gender: r.Student.gender,
            Address: r.Student.address,
            Indigenous: dataSelections.includes("indigenous")?r.Student.indigenous || "No":null,
            ['Person With Disability']: dataSelections.includes("PWD")?r.Student.PWD || "No":null,
            Institute: r.Student.institute,
            course: r.Student.course,
            Year: r.Student.year,
            Section: r.Student.section,
            ["Birth Date"]: r.Student.dateOfBirth,
            Status: r.status
        })
    )

    return CSV
}
export const prismaGetApplicationHistory = async(
    accountId: number, page?: number, dataPerPage?: number, scholarshipId?: number, status?: string, 
    sortBy?: string, order?: string, filter?:{id: string, value: string[]}[], search?: string
): Promise<{applications: Application[], counts: {}[], totalCount: number}>=> {
    const finalSortBy: string|undefined = ["status", "dateCreated"].includes(sortBy as string)? sortBy as string:undefined
    const finalOrder: string = ["asc", "desc"].includes(order as string)? order as string:"asc"
    const [applications, groupCount, totalCount] = await Promise.all([
        prisma.application.findMany({//applications
            take: dataPerPage,
            skip: page? (page - 1) * (dataPerPage || 0):undefined,
            where:{
                ownerId: accountId,
                Scholarship:{
                    ended: true
                }
            },
            include:{
                Scholarship: {
                    include:{
                        Scholarship_Provider: true
                    }
                },
                Student:{
                    include:{
                        Account:{
                            select:{
                                schoolId: true,
                                email: true
                            }
                        }
                    }
                },
                Interview_Decision: true,
                Application_Decision: true
            },
            ...(finalSortBy? {
                orderBy:{
                    [finalSortBy]:finalOrder
                }
            }:{})
        }),
        prisma.application.groupBy({
            by:"status",
            _count:{status: true},
            where:{
                ownerId: accountId,
                Scholarship:{
                    ended: true
                }
            }
        }),
        prisma.application.count({
            where:{
                ownerId: accountId,
                Scholarship:{
                    ended: true
                }
            }
        })
    ])
    const counts: {}[] = groupCount.map(f => ({[f.status]:f._count.status}))

    return {applications, counts, totalCount}
}