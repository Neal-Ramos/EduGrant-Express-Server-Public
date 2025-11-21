import { Auth_Code, PrismaClient } from "@prisma/client";
import { prisma } from "../lib/prisma"

export class AuthCode {
    code: string
    owner: string
    origin: string

    constructor(code: string, owner: string, origin: string){
        this.code = code
        this.owner = owner
        this.origin = origin
    }

    static async Find(owner: string, origin?: string): Promise<Auth_Code|null>{
        return await prisma.auth_Code.findFirst({
            where:{
                owner: owner,
                origin: origin
            }
        })
    }
    static async Create(origin: string, receiver: string, sendCode: string, expiresAt: Date): Promise<Auth_Code>{
        await prisma.auth_Code.deleteMany({
            where:{
                owner: receiver
            }
        })
        return await prisma.auth_Code.create({
            data:{
                origin: origin,
                owner: receiver,
                code: sendCode,
                dateExpiry: expiresAt
            }
        })
    }
    static async validate(code: string, owner: string, origin: string): Promise<{validated: boolean, message: string, AuthCode?: Auth_Code}>{
        const AuthCode = await prisma.auth_Code.findFirst({
            where:{
                code: code,
                owner: owner,
                origin: origin
            }
        })
        if(!AuthCode){
            return {validated: false, message: "Invalid Code!"}
        }
        if(new Date(AuthCode.dateExpiry).getTime() < Date.now()){
            return {validated: false, message: "Code Expired!"}
        }
        return {validated: true, message: "Code Valid!", AuthCode}
    }
    static async DeleteAll(owner: string, origin? :string): Promise<number>{
        return (await prisma.auth_Code.deleteMany({
            where:{
                owner: owner,
                origin: origin
            }
        })).count
    }
}