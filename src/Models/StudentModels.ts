import { PrismaClient, Student, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

type AccountWithRelations = Prisma.StudentGetPayload<{
    include:{
        Application: true,
        Account: {select: {role: true, email: true, schoolId: true}}
    }
}>

export const prismaFiltersStudent = async(status: string|undefined): Promise<{}>=> {

    const StudentFilter = await prisma.student.findMany({
        distinct:['course', 'year', 'section'],
        where:{
            Application:{
                some:{
                    status: status? status : undefined
                }
            }
        },
        select:{
            institute: true,
            course: true,
            year: true,
            section: true
        }
    })
    return {
        course: [...new Set(StudentFilter.map(item=>item.course))], 
        year: [...new Set(StudentFilter.map(item=>item.year))], 
        section: [...new Set(StudentFilter.map(item=>item.section))],
        institute: [...new Set(StudentFilter.map(item=>item.institute))]
    };
}
export const prismaGetDashboardData = async(accountId?: number): Promise<{}> => {
    const [totalApplicationsCount, approvedApplicationsCount, interviewApplicationCount, pendingApplicationCount, 
        recentApplications, announcements, onGoingScholarships] = await Promise.all([
            prisma.application.count({where: {ownerId: accountId}}),
            prisma.application.count({where: {ownerId: accountId, status: "APPROVED"}}),
            prisma.application.count({where: {ownerId: accountId, status: "INTERVIEW"}}),
            prisma.application.count({where: {ownerId: accountId, status: "PENDING"}}),
            prisma.application.findMany({
                take: 5, orderBy: {
                    dateCreated: "asc"
                }, include: {
                    Scholarship: {
                        include: {
                            Scholarship_Provider: true
                        }
                    }, Interview_Decision: true, Application_Decision: true
                },
                where:{
                    ownerId:accountId
                }
            }),
            prisma.announcement.findMany({take: 5}),
            prisma.scholarship.findMany({
                take: 5, 
                where: {
                    deadline: {gt: new Date()},
                    OR:[
                        {phase:1},
                        {AND:[
                            {phase:{gt: 1}},
                            {Application:{some:{ownerId: accountId, status: {notIn:["BLOCKED", "DECLINED"]}}}}
                        ]}
                    ]
                },
            }),
        ])

    return {totalApplicationsCount, approvedApplicationsCount, interviewApplicationCount, pendingApplicationCount, 
        recentApplications, announcements, onGoingScholarships}
}
export const prismaGetStudents = async(page?: number, dataPerPage?: number, sortBy?: string, order?: string, ownderId?: number, filters?: {id: string, value:string[]}[], 
    search?: string): Promise<{students: Student[], totalCount: number}>=> {
    const allowedSort: string[] = ["fName", "lName", "mName", "contactNumber", "gender", "address", "institute", "course", "year", "section"]

    const [students, totalCount] = await Promise.all([
        prisma.student.findMany({
            take: dataPerPage,
            skip: page && dataPerPage? (page - 1) * dataPerPage:undefined,
            where:{
                Account:{
                    role:"Student"
                },
                studentId: ownderId,
                institute: {in: filters?.find(f => f.id === "institute")?.value},
                course: {in: filters?.find(f => f.id === "course")?.value},
                year: {in: filters?.find(f => f.id === "year")?.value},
                section: {in: filters?.find(f => f.id === "section")?.value},
                OR:[
                    {fName: {contains: search, mode: "insensitive"}},
                    {lName: {contains: search, mode: "insensitive"}},
                    {mName: {contains: search, mode: "insensitive"}},
                    {Account:{schoolId: {contains: search, mode: "insensitive"}}},
                ]
            },
            orderBy: [
                ...(allowedSort.includes(sortBy || "")? [{[sortBy as string]: order? order:"asc"}]:[])
            ],
            include:{
                Application: {
                    include: {
                        Interview_Decision: {
                            select:{
                                staffId: true,
                                status: true,
                                message: true,
                                dateCreated: true,
                            }
                        },
                        Application_Decision: {
                            select:{
                                staffId:true,
                                status:true,
                                message:true,
                                dateCreated:true,
                            }
                        },
                        Scholarship: true
                    }
                },
                Account: {
                    select:{
                        role: true,
                        email: true,
                        schoolId: true
                    }
                }
            }
        }),
        prisma.student.count({
            where:{
                Account:{
                    role:"Student"
                },
                studentId: ownderId,
                institute: {in: filters?.find(f => f.id === "institute")?.value},
                course: {in: filters?.find(f => f.id === "course")?.value},
                year: {in: filters?.find(f => f.id === "year")?.value},
                section: {in: filters?.find(f => f.id === "section")?.value},
            },
        })
    ])
    return {students, totalCount}
}
export const prismaGetStudentById = async(accountId: number): Promise<AccountWithRelations | null>=>{
    const student = await prisma.student.findUnique({
        where:{studentId: accountId},
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
    })
    return student
}
export const prismaSearchStudents = async(search?: string, page?: number, dataPerPage?: number, sortBy?: string, order?: string, 
    ownderId?: number, filters?: {id: string, value:string[]}[]): Promise<{students: Student[], totalCount: number}>=> {
        const allowedSortBy: string[] = ["fName", "lName", "mName", "contactNumber", "gender", "address", "institute", "course", "year", "section"]

        const [students, totalCount] = await Promise.all([
            prisma.student.findMany({
                take: dataPerPage,
                skip: page? (page - 1) * (dataPerPage || 0):undefined,
                orderBy: {
                    ...(allowedSortBy.includes(sortBy || "")? {[sortBy as string]: order? order:"asc"}:{})
                },
                where:{
                    OR:[
                        {fName: {contains: search, mode: "insensitive"}},
                        {lName: {contains: search, mode: "insensitive"}},
                        {mName: {contains: search, mode: "insensitive"}},
                        {Account: {schoolId: {contains: search, mode: "insensitive"}}},
                    ],
                    institute: {in: filters?.find(f => f.id === "institute")?.value},
                    course: {in: filters?.find(f => f.id === "course")?.value},
                    year: {in: filters?.find(f => f.id === "year")?.value},
                    section: {in: filters?.find(f => f.id === "section")?.value},
                },
                include:{
                    Account:{
                        select: {
                            email: true,
                            schoolId: true
                        }
                    }
                }
            }),
            prisma.student.count({
                where:{
                    OR:[
                        {fName: {contains: search, mode: "insensitive"}},
                        {lName: {contains: search, mode: "insensitive"}},
                        {mName: {contains: search, mode: "insensitive"}},
                        {Account: {schoolId: {contains: search, mode: "insensitive"}}},
                    ],
                    institute: {in: filters?.find(f => f.id === "institute")?.value},
                    course: {in: filters?.find(f => f.id === "course")?.value},
                    year: {in: filters?.find(f => f.id === "year")?.value},
                    section: {in: filters?.find(f => f.id === "section")?.value},
                }
            })
        ])
        return {students, totalCount}
}
export const  prismaGetFiltersStudentCSV = async(): Promise<any>=> {
    const data = await prisma.student.groupBy({
        by:["institute", "course", "year", "section"],
    })

    const filters = {
        institute: new Set(data.map(d => d.institute)),
        course: new Set(data.map(d => d.course)),
        year: new Set(data.map(d => d.year)),
        section: new Set(data.map(d => d.section)),
    }
    const dataSelections: string[] = ["fName", "lName", "mName", "contactNumber", "gender", "address", "indigenous", "PWD", "institute", "course", "year", "section", "dateOfBirth", "dateCreated", "email", "schoolId"]
    return {filters, dataSelections}
}
export const prismaExportCSV = async(filters: {id: string, value: string[]}[], dataSelections: string[]): Promise<{}[]>=>{
    const Students = await prisma.student.findMany({
        where:{
            gender: {in:filters?.find(f => f.id === "gender")?.value},
            indigenous: filters?.find(f => f.id === "indigenous")? {}:undefined,
            PWD: filters?.find(f => f.id === "PWD")? {not: ""}:undefined,
            institute: {in:filters?.find(f => f.id === "institute")?.value},
            course: {in:filters?.find(f => f.id === "course")?.value},
            year: {in:filters?.find(f => f.id === "year")?.value},
            section: {in:filters?.find(f => f.id === "section")?.value},
        },
        select:{
            fName: dataSelections.includes("fName")? true:false,
            lName: dataSelections.includes("lName")? true:false,
            mName: dataSelections.includes("mName")? true:false,
            contactNumber: dataSelections.includes("contactNumber")? true:false,
            gender: dataSelections.includes("gender")? true:false,
            address: dataSelections.includes("address")? true:false,
            indigenous: dataSelections.includes("indigenous")? true:false,
            PWD: dataSelections.includes("PWD")? true:false,
            institute: dataSelections.includes("institute")? true:false,
            course: dataSelections.includes("course")? true:false,
            year: dataSelections.includes("year")? true:false,
            section: dataSelections.includes("section")? true:false,
            dateOfBirth: dataSelections.includes("dateOfBirth")? true:false,
            dateCreated: dataSelections.includes("dateCreated")? true:false,
            Account:{
                select:{
                    email: dataSelections.includes("email")? true:false,
                    schoolId: dataSelections.includes("schoolId")? true:false,
                }
            }
        }
    })

    const clean = (obj: Record<string, any>) => Object.fromEntries(Object.entries(obj).filter(([_, v]) => v != null));
    const CSV = Students.map(m => ({
        ["First Name"]: m.fName,
        ["Last Name"]: m.lName,
        ["Middle Name"]: m.mName,
        ["Contact Number"]: m.contactNumber,
        Gender: m.gender,
        Address: m.address,
        Indigenous: m.indigenous,
        ["Person With Disability"]: m.PWD,
        Institute: m.institute,
        Course: m.course,
        Year: m.year,
        Section: m.section,
        ["Birth Day"]: m.dateOfBirth,
        ["Account Created"]: m.dateCreated,
        Email: m.Account.email,
        ["School ID"]: m.Account.schoolId,
    }))

    return CSV
}