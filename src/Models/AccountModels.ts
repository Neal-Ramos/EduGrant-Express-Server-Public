import { Account, Prisma, PrismaClient } from "@prisma/client";
import { hashSync } from "bcryptjs";


const prisma = new PrismaClient();

type AccountWithISPSU_Staff = Prisma.AccountGetPayload<{
    include: { ISPSU_Staff: true , ISPSU_Head: true , Student: true}
}>

export const prismaCheckEmailExist = async(email: string): Promise<number>=>{
    const emailExist = await prisma.account.count({
        where:{
            email:email
        }
    })
    return emailExist
}
export const prismaCheckStudentIdExist = async(studentId: string): Promise<AccountWithISPSU_Staff | null>=>{
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
            }
        })
        return createHeadAccount
}
export const prismaCreateStudentAccount = async (studentId: string, studentEmail: string, studentContact: string,
HashedPassword: string, studentFirstName: string, studentMiddleName: string|undefined, studentLastName: string, studentGender: string,
studentDateofBirth: Date, studentAddress: string, course: string, year: string , section: string, institute: string, pwd: string, indigenous: string): Promise<Account>=>{
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
                    PWD: pwd === "true" ? true : false,
                    indigenous: indigenous === "true" ? true : false,
                    familyBackground: {}
                }
            }
        }
    })
    return newStudentAccount;
}
export const getStaffByEmail = async(email: string): Promise<AccountWithISPSU_Staff | null>=>{
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
export const prismaGetAccountById = async(accountId: number): Promise<AccountWithISPSU_Staff | null>=>{
    const getAccount = await prisma.account.findUnique({
        where:{
            accountId: accountId
        },
        include:{
            ISPSU_Staff:true,
            ISPSU_Head:true,
            Student:{
                include:{
                    Application: true
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
    accountId: number, contactNumber: string|undefined ,firstName: string|undefined, middleName: string|undefined ,lastName: string|undefined ,
    gender: string|undefined ,dateOfBirth: Date|undefined ,address: string|undefined ,course: string|undefined ,year: string|undefined ,section: string|undefined ,
    familyBackground: object|undefined, pwd: string|undefined, indigenous: string|undefined): 
    Promise<AccountWithISPSU_Staff>=> {
    const update = await prisma.account.update({
        where:{
            accountId: accountId
        },
        data:{
            Student:{
                update:{
                    fName: firstName? firstName:undefined,
                    lName: lastName? lastName:undefined,
                    mName: middleName? middleName:undefined,
                    gender: gender? gender:undefined,
                    dateOfBirth: dateOfBirth? dateOfBirth:undefined,
                    contactNumber: contactNumber? contactNumber:undefined,
                    address: address? address:undefined,
                    course: course? course:undefined,
                    year: year? year:undefined,
                    section: section? section:undefined,
                    familyBackground: familyBackground? familyBackground:undefined,
                    PWD: pwd? (pwd==="true"? true:false):undefined,
                    indigenous: indigenous? (indigenous==="true"?true:false):undefined,
                }
            }
        },
        include:{ISPSU_Head:true, Student:true, ISPSU_Staff: true}
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