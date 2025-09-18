import { Auth_Code, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const prismaSelectCodeByEmailOrigin = async(email: string, origin: string): Promise<Auth_Code | null>=>{
    const selectCode = await prisma.auth_Code.findFirst({
        where:{
            owner: email,
            origin: origin
        }
    });
    return selectCode;
}
export const validateCode = async(code: string, email: string, origin: string): Promise<Auth_Code | null>=>{
    const validate = await prisma.auth_Code.findFirst({
        where:{
            code: code,
            owner: email,
            origin: origin
        }
    });
    return validate;
}
export const deleteAuthCodeEmailOrigin = async(email: string, origin: string): Promise<number>=>{
    const deleteCode = await prisma.auth_Code.deleteMany({
        where:{
            owner: email,
            origin: origin
        }
    });
    return deleteCode.count;
}
export const prismaCreateAuthCode = async(origin: string, adminEmail: string, sendCode: string, expiresAt: Date): Promise<Auth_Code>=> {
    const newAuthCode = await prisma.auth_Code.create({
        data:{
            origin: origin,
            owner: adminEmail,
            code: sendCode,
            dateExpiry: expiresAt
        }
    })
    return newAuthCode
}