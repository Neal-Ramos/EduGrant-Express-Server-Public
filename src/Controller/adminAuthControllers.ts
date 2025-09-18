import { NextFunction, Request, Response } from "express";
import { SendAuthCode } from "../Config/Resend"
import { randomBytes } from "crypto";
import { sign, verify } from "jsonwebtoken";
import { TokenPayload } from "../Types/adminAuthControllerTypes";
import { compare, hash } from "bcryptjs";
import { adminCodeAuthenticationZodType, adminLoginZodType, adminTokenAuthenticationZodType, createAccountZodType } from "../Zod/ZodSchemanAdminAuth";
import { authHTML } from "../utils/HTML-AuthCode";
import { getStaffByEmail, prismaCheckEmailExist, prismaCreateISPSU_Staff, prismaGetAccountById } from "../Models/AccountModels";
import { deleteAuthCodeEmailOrigin, prismaSelectCodeByEmailOrigin, validateCode } from "../Models/Auth_CodeModels";

export const createISPSUStaffAccount  = async (req: Request, res: Response, next: NextFunction): Promise<void>=> {
    try {
        let {email, firstName, middleName, lastName, phone, password} = (req as Request & {validated: createAccountZodType}).validated.body

        const emailDuplicate = await prismaCheckEmailExist(email)
        if(emailDuplicate){
            res.status(401).json({success:false, message: "Email Already Exist"})
            return
        }

        password = await hash(password, 10)
        const insertAdminToDB = await prismaCreateISPSU_Staff(email, firstName, middleName, lastName, phone, password)
        if(!insertAdminToDB){
            res.status(500).json({success: false, message: "Database Error!"})
            return
        }
        res.status(200).json({success: true, message: "ISPSU Staff Account Created!"})
        return
    } catch (error) {
        next(error)
    }
}

export const adminLogIn = async (req:Request, res: Response, next: NextFunction): Promise<void>=> {
    try {
        const {adminEmail, adminPassword} = (req as Request & {validated: adminLoginZodType}).validated.body

        const correctCredenatials = await getStaffByEmail(adminEmail)
        if(!correctCredenatials){
            res.status(401).json({success:false, message:"Invalid Credentials"});
            return;
        }
        const validatePassword = await compare(adminPassword, correctCredenatials.hashedPassword)
        if(!validatePassword){
            res.status(401).json({success:false, message:"Invalid Credentials"});
            return;
        }
        const checkExistCode = await prismaSelectCodeByEmailOrigin(adminEmail, "adminLogin")
        if(checkExistCode){
            const expiryDate = new Date(checkExistCode.dateExpiry).getTime();
            if(expiryDate > Date.now()){
                res.status(200).json({success: true, message:"Code Already Sent!!"});
                return;
            }
        }
        const sendCode = randomBytes(3).toString("hex");
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        const mailOptions = {
            from: "service@edugrant.online",
            to:adminEmail,
            subject:"Admin Login Code",
            html:authHTML(sendCode)
        }
        const sendMail = await SendAuthCode(mailOptions, "adminLogin", adminEmail, sendCode, expiresAt)
        if(sendMail.success === false){
            res.status(500).json({success:false, message:"Email Not Sent!!", error:sendMail.message});
            return;
        }
        res.status(200).json({ success: true, message: "Email Sent!!" });
    } catch (error) {
        next(error)
    }
};

export const adminCodeAuthentication = async (req: Request, res: Response, next: NextFunction): Promise<void>=> {
    try {
        const {code, adminPassword, adminEmail} = (req as Request & {validated: adminCodeAuthenticationZodType}).validated.body

        const validAccount = await getStaffByEmail(adminEmail);
        if(!validAccount){
            res.status(401).json({success: false, message: "Invalid Credentials!!"});
            return;
        }
        const validatePassword = await compare(adminPassword, validAccount.hashedPassword)
        if(!validatePassword){
            res.status(401).json({success:false, message:"Invalid Credentials"});
            return;
        }
        const codeRecord = await validateCode(code, adminEmail, "adminLogin");// check the code
        if(!codeRecord){
            res.status(401).json({success:false, message:"Invalid Code!"});
            return;
        }
        const expiryDate = new Date(codeRecord.dateExpiry).getTime();// check code if expired
        if(expiryDate < Date.now()){
            res.status(403).json({success:false, message:"Code Expired!!"});
            return;
        }
        const payload = {role:validAccount.role, accountId:validAccount.accountId} // start token gen
        const SECRET = process.env.JWT_SECRET as string;
        const token = sign(payload, SECRET,{expiresIn:"7d"})
        res.cookie("AdminToken", token, {
            httpOnly:true,
            secure:process.env.NODE_ENV === "production",
            sameSite:process.env.NODE_ENV === "production"? "none":"lax",
            maxAge:60000 * 60 * 24 * 7,
            path:"/administrator",
            domain:".edugrant.online"
        });
        const deleteRecentCode = await deleteAuthCodeEmailOrigin(adminEmail, "adminLogin");
        if(!deleteRecentCode){
            res.status(500).json({success: false, message:"Server Error!!!"});
            return;
        }
        const {hashedPassword, ...safeData} = validAccount
        res.status(200).json({success:true, message:"Login Success!", role:validAccount.role, safeData:safeData})
    } catch (error) {
        next(error)
    }
};

export const adminTokenAuthentication = async (req: Request, res: Response, next: NextFunction): Promise<void>=> {
    try {
        const token = (req as Request & {validated: adminTokenAuthenticationZodType}).validated.cookies.AdminToken
        if(!token){
            res.status(401).json({success: false, message: "No Valid Token!"})
            return
        }
        const verifyToken = verify(token, process.env.JWT_SECRET as string) as TokenPayload
        if("ISPSU_Staff" !== verifyToken.role && "ISPSU_Head" !== verifyToken.role){
            res.status(403).json({success:false, message:"Access Prohibited!"});
            return;
        }
        const user = await prismaGetAccountById(typeof verifyToken.accountId === "string"? parseInt(verifyToken.accountId): verifyToken.accountId)
        if(!user){
            res.clearCookie("AdminToken", {
                httpOnly:true,
                secure:process.env.NODE_ENV === "production",
                sameSite:process.env.NODE_ENV === "production"? "none":"lax",
                maxAge:60000 * 60 * 24 * 7,
                domain:".edugrant.online"
            });
            res.status(404).json({success: false, message: "Account Did not Find!"})
            return
        }
        const {hashedPassword, ...safeData} = user
        res.status(200).json({success:true, message:"Access Granted!", safeData:safeData});
    } catch (error) {
        if ((error as {name: string}).name === "TokenExpiredError" || (error as {name: string}).name === "JsonWebTokenError") {
            res.clearCookie("AdminToken", {
                httpOnly:true,
                secure:process.env.NODE_ENV === "production",
                sameSite:process.env.NODE_ENV === "production"? "none":"lax",
                maxAge:60000 * 60 * 24 * 7,
                domain:".edugrant.online"
            });
            res.status(401).json({ success: false, message: "Invalid or expired token" });
            return;
        }
        next(error);
    }
};