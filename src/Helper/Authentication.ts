import { Request } from 'express';
import { prismaGetAccountById } from '../Models/AccountModels';


export const Authenticate = async (req: Request, role?: string) => {//: Promise<number>
    const userId = Number(req.tokenPayload.accountId);
    const user = await prismaGetAccountById(userId)

    if((role && user?.role !== role) || !user) return {isAuuthenticated: false, user: null}

    return user
}