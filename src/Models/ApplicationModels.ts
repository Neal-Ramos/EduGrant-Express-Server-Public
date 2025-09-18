import { Application, Prisma, PrismaClient } from "@prisma/client";
import { ScholarshipApplicationData } from "../Types/postControllerTypes";

const prisma = new PrismaClient();

type ApplicationWithRelation = Prisma.ApplicationGetPayload<{
    include:{Student: true, Scholarship: true}
}>

type ApplicationWithStudentAndScholarship = Prisma.ApplicationGetPayload<{
    include: { Student: true , Scholarship: true }
}>

export const prismaGetApplication = async (applicationId: number): Promise<ApplicationWithRelation | null> => {
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
            Scholarship:{
                include:{
                    Scholarship_Provider: true,
                    ISPSU_Head: true
                }
            }
        }
    });
    return application;
}
export const prismaGetAllApplication = async (status: string|undefined, page: number|undefined, dataPerPage: number|undefined, sortBy: string|undefined, 
    order: string|undefined, filter: Array<{id:string, value:string}>|undefined, scholarshipId: number|undefined, applicationId?:number): Promise<{applications: Application[], totalCount: number}> => {
    const allowedFilterApplication = ["status"]
    const allowedFilterScolarship = ["title"]
    const allowedSortBy = ["status"]
    const allowedSortByStudent = ["fName", "lName", "mName", "indigenous", "PWD", "institute", "course", "year", "section"]

    const whereClause: any = {};

    filter?.forEach((f) => {
        if (allowedFilterApplication.includes(f?.id || '')) {
            whereClause[f!.id] = f!.value;
        }
        if (allowedFilterScolarship.includes(f?.id || '')) {
            if (!whereClause.Scholarship) whereClause.Scholarship = {};
            whereClause.Scholarship[f!.id] = f!.value;
        }
    });

    const transac = await prisma.$transaction(async (tx) => {
        const applications = await tx.application.findMany({
            ...(dataPerPage? { take: dataPerPage } : undefined),
            ...(dataPerPage && page ? { skip: (page - 1) * dataPerPage, take: dataPerPage } : undefined),
            where:{
                applicationId: applicationId? applicationId:undefined,
                status: status ? status : undefined,
                scholarshipId: scholarshipId ? scholarshipId : undefined,
                ...whereClause
            },
            orderBy:{
                ...(allowedSortBy.includes(sortBy || "") ? { [sortBy as string]: order === "desc" ? "desc" : "asc" } : undefined),
                ...(allowedSortByStudent.includes(sortBy || "") ? { Student: { [sortBy as string]: order === "desc" ? "desc" : "asc" } } : undefined)
            },
            include:{ Student:{include:{Account:{select:{accountId: true, schoolId: true,email: true,role: true}}}}, Scholarship:{include:{Scholarship_Provider: true, ISPSU_Head: true}} }
        });
        const totalCount = await tx.application.count({
            where:{
                applicationId: applicationId? applicationId:undefined,
                status: status ? status : undefined,
                scholarshipId: scholarshipId ? scholarshipId : undefined,
                ...whereClause
            },
        })
        return {applications, totalCount}
    })
    return transac;
}
export const prismaGetAllAccountApplication = async (status: string|undefined, page: number|undefined, dataPerPage: number|undefined, sortBy: string|undefined, 
    order: string|undefined, filter: Array<{id:string, value:string}>|undefined, scholarshipId: number|undefined, applicationId?:number, accountId?: number): Promise<{applications: Application[], totalCount: number}> => {
    const allowedFilterApplication = ["status"]
    const allowedFilterScolarship = ["title"]
    const allowedSortBy = ["status"]
    const allowedSortByStudent = ["fName", "lName", "mName", "indigenous", "PWD", "institute", "course", "year", "section"]

    const whereClause: any = {};

    filter?.forEach((f) => {
        if (allowedFilterApplication.includes(f?.id || '')) {
            whereClause[f!.id] = f!.value;
        }
        if (allowedFilterScolarship.includes(f?.id || '')) {
            if (!whereClause.Scholarship) whereClause.Scholarship = {};
            whereClause.Scholarship[f!.id] = f!.value;
        }
    });

    const transac = await prisma.$transaction(async (tx) => {
        const applications = await tx.application.findMany({
            ...(dataPerPage? { take: dataPerPage } : undefined),
            ...(dataPerPage && page ? { skip: (page - 1) * dataPerPage, take: dataPerPage } : undefined),
            where:{
                applicationId: applicationId? applicationId:undefined,
                ownerId: accountId? accountId:undefined,
                status: status ? status : undefined,
                scholarshipId: scholarshipId ? scholarshipId : undefined,
                ...whereClause
            },
            orderBy:{
                ...(allowedSortBy.includes(sortBy || "") ? { [sortBy as string]: order === "desc" ? "desc" : "asc" } : undefined),
                ...(allowedSortByStudent.includes(sortBy || "") ? { Student: { [sortBy as string]: order === "desc" ? "desc" : "asc" } } : undefined)
            },
            include:{ Student:{include:{Account:{select:{accountId: true, schoolId: true,email: true,role: true}}}}, Scholarship:{include:{Scholarship_Provider: true, ISPSU_Head: true}} }
        });
        const totalCount = await tx.application.count({
            where:{
                applicationId: applicationId? applicationId:undefined,
                ownerId: accountId? accountId:undefined,
                status: status ? status : undefined,
                scholarshipId: scholarshipId ? scholarshipId : undefined,
                ...whereClause
            },
        })
        return {applications, totalCount}
    })
    return transac;
}
export const prismaSearchApplication = async(search: string|undefined, status: string|undefined, sortBy: string|undefined, order: string|undefined, 
    page: number|undefined, dataPerPage: number|undefined): Promise<{applications: Application[], totalCount:number}> => {
        const allowedStatusFilter = ["DECLINED", "PENDING", "APPROVED", "INTERVIEW"]
        const allowedSortBy = ["studentId", "status"]

        const transac = await prisma.$transaction(async (tx) => {
            const applications = await tx.application.findMany({
                ...(dataPerPage? { take: dataPerPage } : undefined),
                ...(dataPerPage && page ? { skip: (page - 1) * dataPerPage, take: dataPerPage } : undefined),
                orderBy:{
                    ...(allowedSortBy.includes(sortBy || "") ? { [sortBy as string]: order === "desc" ? "desc" : "asc" } : undefined)
                },
                where: {
                    ...(allowedStatusFilter.includes(status||'') ? { status: status } : undefined),
                    OR: [
                        {Student:{fName:{contains:search, mode: 'insensitive'}}},
                        {Student:{lName:{contains:search, mode: 'insensitive'}}},
                        {Student:{mName:{contains:search, mode: 'insensitive'}}},
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
                    }
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
export const prismaCheckApproveGov = async(accountId: number): Promise<Application|null> => {
    const applications = await prisma.application.findFirst({
        where:{
            ownerId: accountId,
            status: "APPROVED",
            Scholarship:{
                type: "government"
            }
        }
    });
    return applications;
}
export const prismaDeleteApplication = async(applicationIds: number[]): Promise<number> => {
    const transac = await prisma.$transaction(async (tx) => {
        const applications = await tx.application.findMany({
            where: {
                applicationId: { in: applicationIds }
            },
            select:{
                scholarshipId: true,
                status: true
            }
        });
        const scholarshipRecords: Record<string, {id: number,count:number, status: string}> = {};
        for (const app of applications) {
            const key = `${app.scholarshipId}-${app.status}`;
            if(!scholarshipRecords[key]){
                scholarshipRecords[key] = {id: app.scholarshipId || 0, count:1, status: app.status}
            }else{
                scholarshipRecords[key].count++;
            }
        }
        const deleteResult = await tx.application.deleteMany({
            where: {
                applicationId: { in: applicationIds }
            }
        });
        return {deleteResult, scholarshipRecords}
    })
    for(const key in transac.scholarshipRecords){
        const scholarshipId = transac.scholarshipRecords[key].id;
        const count = transac.scholarshipRecords[key].count;
        const status = transac.scholarshipRecords[key].status
        await prisma.scholarship.update({
            where:{
                scholarshipId: scholarshipId
            },
            data:{
                pending: status === "PENDING" || status === "INTERVIEW"? {decrement:count}: undefined,
                declined: status === "DECLINED"? {decrement:count}: undefined,
                approved: status === "APPROVED"? {decrement:count}: undefined,
            }
        })
    }
    return transac.deleteResult.count;
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
export const prismaApproveApplication = async (applicationId: number,accountId: number): Promise<Application> => {
    const transac = await prisma.$transaction(async (tx) => {
        const approveApplication = await prisma.application.update({
            where:{
                applicationId: applicationId
            },
            data:{
                status: "APPROVED",
                Application_Decision:{
                    create:{
                        staffId: accountId,
                        status: "APPROVED",
                },
            }
        }})
        await tx.scholarship.update({
            where:{
                scholarshipId: approveApplication.scholarshipId || 0
            },
            data:{
                approved:{
                    increment:1
                },
                pending:{
                    decrement:1
                }
            }
        })
        const otherGovApplications = await tx.application.findMany({
            where:{
                ownerId: approveApplication.ownerId,
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
            await tx.scholarship.update({
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
        const result = await tx.application.updateMany({
            where:{
                ownerId: approveApplication.ownerId,
                status: {not: "APPROVED"},
                Scholarship:{
                    type: "government"
                }
            },
            data:{
                status: "BLOCKED"
            }
        })
        return approveApplication;
    })
    
    return transac;
}
export const prismaAcceptForInterview = async (applicationId: number,accountId: number): Promise<Application> => {
    const interviewApplication = await prisma.application.update({
        where:{
            applicationId: applicationId
        },
        data:{
            status: "INTERVIEW",
            Interview_Decision:{
                create:{
                    staffId: accountId,
                    status: "INTERVIEW",
                }
            }
        },
        include:{
            Student:true,
            Scholarship:true
        }
    })
    return interviewApplication;
}
export const prismaDeclineApplication = async(applicationId: number, accountId: number, rejectMessage: {}): Promise<ApplicationWithStudentAndScholarship> => {
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
                        message: rejectMessage
                    }
                }
            },
            include:{
                Student:true,
                Scholarship:true
            }
        })
        await tx.scholarship.update({
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
        })
        return declineApplication;
    })
    
    return transac;
}
export const prismaCheckApplicationDuplicate = async(accountId: number, scholarshipId: number): Promise<Application | null> => {
    const applicationDuplicate = await prisma.application.findFirst({
        where:{
            ownerId: accountId,
            scholarshipId: scholarshipId
        }
    });
    return applicationDuplicate;
}
export const prismaCreateApplication = async (fileRequirements: ScholarshipApplicationData, accountId: number, scholarshipId: number): Promise<Application> => {
    const transac = await prisma.$transaction( async(tx) => {
        const application = await tx.application.create({
            data:{
                ownerId:accountId,
                scholarshipId:scholarshipId,
                supabasePath: fileRequirements.supabasePath,
                submittedDocuments: {documents: fileRequirements.submittedDocuments},
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
export const prismaUpdateApplicationDocuments = async(applicationId: number, newApplicationDocuments: {}): Promise<number>=> {
    const result = await prisma.application.update({
        where:{
            applicationId: applicationId
        },
        data:{
            submittedDocuments:{
                documents: newApplicationDocuments
            }
        }
    })
    return result.applicationId
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