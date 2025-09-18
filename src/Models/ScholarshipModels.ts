import { Prisma, PrismaClient, Scholarship } from "@prisma/client";
import { ResponseUploadSupabase } from "../Config/Supabase";

const prisma = new PrismaClient()

type ScholarshipWithChild = Prisma.ScholarshipGetPayload<{
    include:{
        Application: true,
        Scholarship_Provider: true
        ISPSU_Head: true
    }
}>

export const prismaCreateScholarship = async(scholarshipType: string, newScholarTitle: string, newScholarProvider: string,  newScholarDeadline: Date, newScholarDescription: string,
        scholarshipDocuments: {[key: string]: string}, scholarshipAmount: string|undefined, scholarshipLimit: number|undefined, gwa: number|undefined, accountId: number, 
        sponsorResult: ResponseUploadSupabase, coverResult: ResponseUploadSupabase, formResult: ResponseUploadSupabase, isForInterview: string): Promise<Scholarship>=> {
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
            form: formResult.publicUrl,
            supabasePath: {
                cover:  coverResult.path,
                logo:  sponsorResult.path,
                form:  formResult.path
            },
            approved: 0,
            declined: 0,
            pending: 0,
            renew: false,
            interview: isForInterview === 'true' ? true : false,
            archived: false,
            documents: scholarshipDocuments,
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
        }
    });
    return newScholarship;
}
export const prismaGetScholarship = async(page: number|undefined, dataPerPage: number|undefined, sortBy: string|undefined, order: string|undefined, status: string|undefined, 
    filters: {id: string, value: string}[]|undefined): Promise<{scholarship: Scholarship[], totalCount: number}>=>{
        const allowedSortBy: string[] = ["title", "description", "type", "approved", "declined", "renew", "interview", "archived", "deadline", "dateCreated"]
        const allowedFilters: string[] = ["title", "amount", "description", "type"]
        const allowedStatus: string[] = ["ACTIVE", "ARCHIVED", "EXPIRED"]
        const allowedOrder: string[] = ["asc", "desc"]
        const whereClause: any = {}
        for(const value of filters || []){
            if(allowedFilters.includes(value.id)){
                whereClause[value.id] = value.value
            }
        }
        if (status && allowedStatus.includes(status)) {
            if (status === "ARCHIVED") {
                whereClause.archived = true
            } else if (status === "EXPIRED") {
                whereClause.deadline = { lt: new Date() }
            } else if (status === "ACTIVE") {
                whereClause.deadline = { gt: new Date() }
            } else if(status === "RENEW"){
                whereClause.renew = true
            }
        }

        const transac = await prisma.$transaction(async (tx) => {
            const scholarship = await tx.scholarship.findMany({
                ...(dataPerPage? {take: dataPerPage}:undefined),
                ...(page && dataPerPage? {skip: (page-1)*dataPerPage}:undefined),
                orderBy: {
                    ...(allowedSortBy.includes(sortBy||'')? {[sortBy||'']: allowedOrder.includes(order||'')? order : 'asc'} : {dateCreated: 'asc'})
                },
                include:{
                    Scholarship_Provider: true
                },
                where: whereClause
            })
            const totalCount = await tx.scholarship.count({
                where: whereClause
            })
            return {scholarship, totalCount}
        })
        return transac;
}
export const prismaGetRenewScholarship = async(page: number|undefined, dataPerPage: number|undefined, sortBy: string|undefined, order: string|undefined, status: string|undefined, 
    filters: {id: string, value: string}[]|undefined, accountId: number): Promise<{scholarship: Scholarship[], totalCount: number}>=>{
        const allowedSortBy: string[] = ["title", "description", "type", "approved", "declined", "renew", "interview", "archived", "deadline", "dateCreated"]
        const allowedFilters: string[] = ["title", "amount", "description", "type"]
        const allowedStatus: string[] = ["ACTIVE", "ARCHIVED", "EXPIRED"]
        const allowedOrder: string[] = ["asc", "desc"]
        const whereClause: any = {
            renew: true,
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
                whereClause.archived = true
            } else if (status === "EXPIRED") {
                whereClause.deadline = { lt: new Date() }
            } else if (status === "ACTIVE") {
                whereClause.deadline = { gt: new Date() }
            } else if(status === "RENEW"){
                whereClause.renew = true
            }
        }

        const transac = await prisma.$transaction(async (tx) => {
            const scholarship = await tx.scholarship.findMany({
                ...(dataPerPage? {take: dataPerPage}:undefined),
                ...(page && dataPerPage? {skip: (page-1)*dataPerPage}:undefined),
                orderBy: {
                    ...(allowedSortBy.includes(sortBy||'')? {[sortBy||'']: allowedOrder.includes(order||'')? order : 'asc'} : {dateCreated: 'asc'})
                },
                include:{
                    Scholarship_Provider: true
                },
                where:whereClause
            })
            const totalCount = await tx.scholarship.count({
                where: whereClause
            })
            return {scholarship, totalCount}
        })
        return transac;
}
export const prismaSearchScholarshipTitle = async(page: number|undefined, dataPerPage: number|undefined, search: string|undefined, 
    sortBy: string|undefined, order: string|undefined, status: string|undefined): Promise<{searchResults: Scholarship[], totalCount: number}>=>{
    const allowedSortBy: string[] = ["title", "description", "type", "approved", "declined", "renew", "interview", "archived", "deadline", "dateCreated"]
    const allowedFilters: string[] = ["title", "amount", "description", "type"]
    const allowedStatus: string[] = ["active", "archived", "expired"]
    const allowedOrder: string[] = ["asc", "desc"]
    const whereClause: any = {
        ...(search? {title: { contains: search, mode: 'insensitive' }}:undefined)
    }
    if (status && allowedStatus.includes(status)) {
        if (status === "archived") {
            whereClause.archived = true
        } else if (status === "expired") {
            whereClause.deadline = { lt: new Date() }
        } else if (status === "active") {
            whereClause.deadline = { gt: new Date() }
        }
    }

    const transac = await prisma.$transaction(async (tx) => {
        const searchResults = await tx.scholarship.findMany({
            ...(dataPerPage? {take: dataPerPage}:undefined),
            ...(page && dataPerPage? {skip: (page-1)*dataPerPage}:undefined),
            orderBy:{
                ...(allowedSortBy.includes(sortBy||'')? {[sortBy||'']: allowedOrder.includes(order||'')? order : 'asc'} : undefined)
            },
            where: whereClause,
            include:{
                Scholarship_Provider: true
            }
        })
        const totalCount = await tx.scholarship.count({
            where: whereClause
        })
        return {searchResults, totalCount};
    })
    
    return transac;
}
export const prismaGetScholarshipsById = async(scholarshipId: number): Promise<Scholarship | null>=>{
    const scholarship = await prisma.scholarship.findUnique({
        where:{
            scholarshipId: scholarshipId
        },
        include:{
            Scholarship_Provider: true
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
        }
    })
    return updateScholarship;
}
export const prismaRenewScholarship = async(accountId: number, scholarshipId: number, updatedRequirements: object): Promise<Scholarship | null>=>{
    const renewScholarship = await prisma.scholarship.update({
        where: {
            scholarshipId: scholarshipId
        },
        data: {
            documents: updatedRequirements
        }
    })
    return renewScholarship;
}
export const prismaDeleteScholarship = async(scholarshipId: number): Promise<number>=>{
    const deletedScholarship = await prisma.scholarship.deleteMany({
        where:{
            scholarshipId: scholarshipId
        }
    })
    return deletedScholarship.count;
}
export const prismaArchiveScholarship = async (scholarshipId: number): Promise<Scholarship|null>=> {
    const result = await prisma.scholarship.update({
        where:{
            scholarshipId: scholarshipId
        },
        data:{
            archived: true
        }
    })
    return result
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
            ...(status === "ARCHIVED"? {archived:true}:undefined),
            ...(status === "RENEWED"? {renew:true}:undefined),
        },
        distinct: ['title'],
        select:{
            title: true
        }
    })
    const provider = await prisma.scholarship_Provider.findMany({
        distinct:['name'],
        select:{
            name: true
        }
    })
    return {scholarship: filterScholarship.map(e => e.title), provider: provider.map(e => e.name)};
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
export const prismaSelectValidArchiveScolarship = async(ids: number[]): Promise<number>=> {
    const result = await prisma.scholarship.updateMany({
        where:{
            scholarshipId: {in: ids},
            archived: false,
            deadline: {lt: new Date()}
        },
        data:{
            archived: true
        }
    })
    return result.count;
}