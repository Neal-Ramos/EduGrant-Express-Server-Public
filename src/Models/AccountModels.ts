import { Account } from "@prisma/client";
import { hashSync } from "bcryptjs";
import { ResponseUploadSupabase } from "../Config/Supabase";
import { AccountRelations, prismaGetAccountByIdType, prismaUpdateStaffAccountType } from "../Types/AccountTypes";
import { prisma } from "../lib/prisma"

export const prismaCheckEmailExist = async(email: string): Promise<AccountRelations|null>=>{
    const emailExist = await prisma.account.findUnique({
        where:{
            email:email
        },
        include:{Student:true, ISPSU_Head:true, ISPSU_Staff:true}
    })
    return emailExist
}
export const prismaCheckStudentIdExist = async(studentId: string): Promise<AccountRelations | null>=>{
    const studentIdExist = await prisma.account.findFirst({
        where:{
            schoolId: studentId
        },
        include:{ ISPSU_Staff: true , ISPSU_Head: true , Student: true}
    })
    return studentIdExist
}
export const prismaCreateISPSU_Staff = async (email: string, firstName: string, middleName: string|undefined, lastName: string, phone: string, 
    passwordHash: string): Promise<Account>=> {
        const createHeadAccount = await prisma.account.create({
            data:{
                email: email,
                hashedPassword: passwordHash,
                role: "ISPSU_Staff",
                ISPSU_Staff:{
                    create:{
                        fName: firstName,
                        mName: middleName? middleName:undefined,
                        lName: lastName,
                    }
                }
            },
            include:{
                ISPSU_Staff: true
            }
        })
        return createHeadAccount
}
export const prismaCreateStudentAccount = async (fourPs: boolean, dswd: boolean, civilStatus: string, studentType: string, studentId: string, studentEmail: string, studentContact: string,
HashedPassword: string, studentFirstName: string, studentMiddleName: string|undefined, studentLastName: string, studentGender: string,
studentDateofBirth: Date, studentAddress: string, course: string, year: string , section: string, institute: string, pwd?: string, indigenous?: string,
prefixName?: string): Promise<Account>=>{
    const newStudentAccount = await prisma.account.create({
        data:{
            email: studentEmail,
            hashedPassword: HashedPassword,
            role: "Student",
            schoolId: studentId,
            Student:{
                create:{
                    fName: studentFirstName,
                    mName: studentMiddleName? studentMiddleName:undefined,
                    lName: studentLastName,
                    gender: studentGender,
                    dateOfBirth: studentDateofBirth,
                    contactNumber: studentContact,
                    address: studentAddress,
                    course: course,
                    year: year,
                    section: section,
                    institute: institute,
                    PWD: pwd,
                    indigenous: indigenous,
                    familyBackground: {},
                    dswdMember: dswd,
                    fourPsMember: fourPs,
                    civilStatus: civilStatus,
                    studentType: studentType,
                    prefixName: prefixName
                }
            }
        }
    })
    return newStudentAccount;
}
export const getStaffByEmail = async(email: string): Promise<AccountRelations | null>=>{
    const getStaff = await prisma.account.findFirst({
        where:{
            email: email
        },
        include:{
            ISPSU_Head:true,
            ISPSU_Staff:true,
            Student:true
        }
    });
    return getStaff;
}

export const prismaGetAccountById = async(accountId: number): Promise<prismaGetAccountByIdType | null>=>{
    const getAccount = await prisma.account.findUnique({
        where:{
            accountId: accountId
        },
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
    });
    return getAccount;
}
export const prismaDeleteAccount = async(accountId: number[]): Promise<number>=>{
    const deleteAccount = await prisma.account.deleteMany({
        where:{
            accountId: { in: accountId}
        }
    })
    return deleteAccount.count
}
export const prismaUpdateStudentAccount = async (
    accountId: number, contactNumber?: string ,firstName?: string, middleName?: string ,lastName?: string ,
    gender?: string ,dateOfBirth?: Date ,address?: string ,course?: string ,year?: string ,section?: string ,
    familyBackground?: object, pwd?: string, indigenous?: string, profileImg?: ResponseUploadSupabase): 
    Promise<AccountRelations>=> {
    const update = await prisma.account.update({
        where:{
            accountId: accountId
        },
        data:{
            Student:{
                update:{
                    fName: firstName,
                    lName: lastName,
                    mName: middleName,
                    gender: gender,
                    dateOfBirth: dateOfBirth,
                    contactNumber: contactNumber,
                    address: address,
                    course: course,
                    year: year,
                    section: section,
                    familyBackground: familyBackground,
                    PWD: typeof pwd === "string"? pwd:undefined,
                    indigenous: typeof pwd === "string"? indigenous:undefined,
                    ...(profileImg? {profileImg: {path: profileImg.path, publicUrl: profileImg.publicUrl}}:{})
                }
            }
        },
        include:{ISPSU_Head:true, Student:{include: {Application: true}}, ISPSU_Staff: true}
    })
    return update
}
export const prismaUpdateAccountLoginCredentials = async(accountId: number, schoolId: string|undefined, newEmail: string|undefined
    , newPassword: string|undefined): Promise<Account|null>=> {
    const result = await prisma.account.update({
        where:{
            accountId: accountId
        },
        data:{
            schoolId: schoolId? schoolId:undefined,
            email: newEmail? newEmail:undefined,
            hashedPassword: newPassword? hashSync(newPassword, 10):undefined
        }
    })
    return result
}
export const prismaUpdateAccountPassword = async(email: string, hashedPassword: string): Promise<AccountRelations|null>=> {
    const updatePassword = await prisma.account.update({
        where:{
            email: email
        },
        data:{
            hashedPassword: hashedPassword
        },
        include:{
            Student: true,
            ISPSU_Head: true,
            ISPSU_Staff: true
        }
    })
    return updatePassword
}
export const prismaUpdateHeadAccount = async(accountId: number, address?: string, firstName?: string, lastName?: string, middleName?: string, gender?: string, newProfileImg?: ResponseUploadSupabase): Promise<Account>=> {
    const update = await prisma.account.update({
        where:{accountId: accountId},
        data:{
            ISPSU_Head: {
                update: {
                    addres: address,
                    fName: firstName,
                    lName: lastName,
                    mName: middleName,
                    gender: gender,
                    profileImg: {
                        path: newProfileImg?.path,
                        publicUrl: newProfileImg?.publicUrl
                    }
                }
            }
        },
        include:{
            ISPSU_Head: true,
            ISPSU_Staff: true,
            Student: true
        }
    })
    return update
}
export const prismaUpdateStaffAccount = async(accountId: number, fName?: string, lName?: string, mName?: string, email?: string, 
    hashedPassword?: string, validate?: string, profileURL?: ResponseUploadSupabase): Promise<prismaUpdateStaffAccountType|null>=> {
    const newValidate = validate === "true"?
     true : validate === "false"?
      false : undefined
    const update = await prisma.account.update({
        where:{
            accountId: accountId
        },
        data:{
            email: email,
            hashedPassword: hashedPassword,
            ISPSU_Staff: {
                update:{
                    fName: fName,
                    lName: lName,
                    mName: mName,
                    validated: newValidate,
                    ...(profileURL? {
                        profileImg: {
                            publicURL: profileURL.publicUrl,
                            path: profileURL.path
                        }
                    }:{})
                }
            }
        },
        include:{
            ISPSU_Staff: true,
        }
    })
    return update
}
export const prismaGetHeadDashboard = async(): Promise<{}>=> {
    const [applications, scholarship, applcationCount, approvedApplcationCount, pendingApplcationCount, activeScholarshipCount,PWDApplicationCount, indiginousApplicationCount, 
        GeneralCount, applicationCountPerInsti, annoucement, applicationCountToday, applicationPendingToday, applicationApprovedToday, scholarshipCountToday] = await Promise.all([
        prisma.application.findMany({
            take: 5,
            include: {Student: {include: {Account: {select: {schoolId: true, email: true}}}}}
        }),
        prisma.scholarship.findMany({take: 5, where:{ended: false}, include:{Scholarship_Provider: true}}),
        prisma.application.count(),
        prisma.application.count({where: {status: "APPROVED"}}),
        prisma.application.count({where: {status: "PENDING"}}),
        prisma.scholarship.count({where: {deadline: {gt: new Date()}}}),
        prisma.application.count({where: {Student: {PWD: {not: ""}}}}),
        prisma.application.count({where: {Student: {indigenous: {not: ""}}}}),
        prisma.application.count({where: {Student: {indigenous: "", PWD: ""}}}),
        prisma.$queryRaw<
            { institute: string; applicationCount: number }[]
        >`
        SELECT s."institute", CAST(COUNT(a."applicationId") AS INTEGER) AS "applicationCount"
        FROM "Application" a
        JOIN "Student" s ON s."studentId" = a."ownerId"
        GROUP BY s."institute"
        ORDER BY "applicationCount" DESC
        `,
        prisma.announcement.findMany({
            take: 5
        }),
        prisma.application.count({
            where:{
                dateCreated:{
                    gte: new Date(new Date().setHours(0, 0, 0, 0)),
                    lte: new Date(new Date().setHours(23, 59, 59, 999))
                }
            }
        }),
        prisma.application.count({
            where:{
                dateCreated:{
                    gte: new Date(new Date().setHours(0, 0, 0, 0)),
                    lte: new Date(new Date().setHours(23, 59, 59, 999))
                },
                status:"PENDING"
            }
        }),
        prisma.application.count({
            where:{
                Application_Decision: {
                    some:{
                        dateCreated:{
                        gte: new Date(new Date().setHours(0, 0, 0, 0)),
                        lte: new Date(new Date().setHours(23, 59, 59, 999))
                        },
                        status: "APPROVED"
                    }
                }
            }
        }),
        prisma.scholarship.count({
            where:{
                dateCreated:{
                    gte: new Date(new Date().setHours(0, 0, 0, 0)),
                    lte: new Date(new Date().setHours(23, 59, 59, 999))
                }
            }
        })
    ])

    return {applications, scholarship, applcationCount, approvedApplcationCount, pendingApplcationCount, activeScholarshipCount,PWDApplicationCount, indiginousApplicationCount, 
        GeneralCount, applicationCountPerInsti, annoucement, applicationCountToday, applicationPendingToday, applicationApprovedToday, scholarshipCountToday}
}
export const prismaHEADUpdateStudentAccount = async(ownerId: number, email?: string, newHashedPass?: string, schoolId?: string, fName?: string, lName?: string, mName?: string, 
    contactNumber?: string, gender?: string, address?: string, indigenous?: string, PWD?: string, institute?: string, course?: string, year?: string, section?: string, dateOfBirth?: Date): Promise<Account | null>=> {
    const update = await prisma.account.update({
        where:{
            accountId: ownerId
        },
        data:{
            email: email,
            schoolId: schoolId,
            hashedPassword: newHashedPass,
            Student: {
                update:{
                    fName: fName,
                    lName: lName,
                    mName:mName,
                    contactNumber: contactNumber,
                    gender: gender,
                    address: address,
                    indigenous: indigenous,
                    PWD: PWD,
                    institute: institute,
                    course: course,
                    year: year,
                    section: section,
                    dateOfBirth: dateOfBirth,
                }
            }
        },
        include:{
            Student: true
        }
    })
    return update
}
export const prismaUpdateWebTour = async(accountId: number, webTour: Record<string, boolean>): Promise<Account|null>=> {
    return await prisma.account.update({
        where:{
            accountId: accountId
        },
        data:{
            webTours: webTour
        }
    })
}