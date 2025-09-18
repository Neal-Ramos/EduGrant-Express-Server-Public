import { NextFunction, Request, Response } from "express"
import { changeLoginCredentialsSendAuthCodeZodType, logoutZodType, updateApplicationZodType, updateStudentInfoZodType } from "../Zod/ZodSchemaUserUser";
import { verify } from "jsonwebtoken";
import { TokenPayload } from "../Types/authControllerTypes";
import { PrismaClient } from "@prisma/client";
import { DeleteSupabase, ResponseUploadSupabase, UploadSupabase, UploadSupabasePrivate } from "../Config/Supabase";
import { prismaGetAccountById, prismaUpdateAccountLoginCredentials, prismaUpdateStudentAccount } from "../Models/AccountModels";
import { prismaGetScholarshipDocuments } from "../Models/ScholarshipModels";
import { success } from "zod";
import { compare } from "bcryptjs";
import { CreateEmailOptions } from "resend";
import { SendAuthCode } from "../Config/Resend";
import { randomBytes } from "crypto";
import { prismaSelectCodeByEmailOrigin } from "../Models/Auth_CodeModels";
import { authHTML } from "../utils/HTML-AuthCode";
import { prismaGetApplicationByIdScholarshipId } from "../Models/Application_DecisionModels";
import { prismaGetApplication, prismaUpdateApplicationDocuments } from "../Models/ApplicationModels";

const prisma = new PrismaClient()
export const logoutUser = async (req: Request, res: Response, next: NextFunction): Promise<void>=> {
    try {
        const {token} = (req as Request & {validated: logoutZodType}).validated.cookies

        res.clearCookie("token", {
            httpOnly:true,
            secure:process.env.NODE_ENV === "production",
            sameSite:process.env.NODE_ENV === "production"? "none":"lax",
            maxAge:60000 * 60 * 24 * 7,
            path:"/",
            domain:".edugrant.online"
        });
        res.status(200).json({ success: true, message: "Logged out successfully!" });
    } catch (error) {
        next(error);
    }
}
export const updateStudentInfo = async (req: Request, res: Response, next: NextFunction): Promise<void>=> {
    try {
        const {accountId ,contactNumber ,firstName ,middleName ,lastName ,gender ,dateOfBirth ,
            address ,course ,year ,section ,familyBackground, pwd, indigenous } = (req as Request & {validated: updateStudentInfoZodType}).validated.body
        const validateUser = await prismaGetAccountById(accountId)
        if(!validateUser){
            res.status(404).json({success: false, message: "Account Did not Find!"})
            return
        }

        const updateStudent = await prismaUpdateStudentAccount(accountId, contactNumber ,firstName ,
            middleName ,lastName ,gender ,dateOfBirth ,address ,course ,year ,section ,
            familyBackground, pwd, indigenous)

        if(!updateStudent){
            res.status(500).json({success: true, message: "Server Error!"})
            return
        }
        res.status(200).json({success: true, message: "Account Information Updated!"})
    } catch (error) {
        next(error)
    }
}
export const updateApplication = async (req: Request, res: Response, next: NextFunction): Promise<void>=> {
    try {
        const {accountId, scholarshipId, applicationId} = (req as Request & {validated: updateApplicationZodType}).body
        const rawFiles = req.files as Express.Multer.File[]

        const application = await prismaGetApplication(applicationId)
        if(!application){
            res.status(404).json({success: false, message: "Application Not Found!"})
            return
        }
        if(application.ownerId !== accountId){
            res.status(403).json({success: false, message: "Access Prohibited!"})
            return
        }
        const fileRequirements = (application.Scholarship?.documents as {documents: Record<string,{label: string, formats: string[], requirementType:string}>}).documents
        const newApplicationDocuments = (application.submittedDocuments as {documents: Record<string, {fileUrl: string, document:string, fileFormat:string, resourceType:string, supabasePath: string, requirementType:string}>})?.documents || {}
        const deleteFiles: string[]=[]

        for(const [key, value] of Object.entries(fileRequirements)){
            const newFile = rawFiles.find(e => e.fieldname===key)
            if(newFile){
                const upload: ResponseUploadSupabase = await UploadSupabase(newFile, "student-application-files")
                newApplicationDocuments[key] && deleteFiles.push(newApplicationDocuments[key].supabasePath)
                newApplicationDocuments[key] = {
                    fileUrl: upload.publicUrl,
                    document: value.label,
                    fileFormat: newFile.mimetype,
                    resourceType: newFile.mimetype,
                    supabasePath: upload.path,
                    requirementType: value.requirementType
                }
            }
        }

        const updateApplicationDocuments = await prismaUpdateApplicationDocuments(applicationId, newApplicationDocuments)
        if(!updateApplicationDocuments){
            res.status(500).json({success: false, message: "Server Error!"})
            return
        }
        res.status(200).json({success: true, message: "Application Updated!"})
        const cleanUp = await DeleteSupabase(deleteFiles)
        if(!cleanUp.success){
            console.log(`Clean Up Fail: ${cleanUp.error}`)
        }
    } catch (error) {
        next(error)
    }
}
export const changeLoginCredentialsSendAuthCode = async(req: Request, res: Response, next: NextFunction): Promise<void>=> {
    try {
        const {accountId, schoolId, newEmail, oldEmail, oldPassword, newPassword} = (req as Request & {validated: changeLoginCredentialsSendAuthCodeZodType}).validated.body
        
        const checkAccount = await prismaGetAccountById(accountId)
        if(!checkAccount){
            res.status(404).json({success: false, message: "Account Did Not Found!"})
            return
        }
        if (oldEmail && oldEmail !== checkAccount.email) {
            res.status(401).json({ success: false, message: "Old Email Incorrect!" });
            return;
        }
        if (oldEmail && !newEmail) {
            res.status(401).json({ success: false, message: "New Email Required!" });
            return;
        }
        if (oldPassword) {
            const isMatch = await compare(oldPassword, checkAccount.hashedPassword);
            if (!isMatch) {
                res.status(401).json({ success: false, message: "Old Password Incorrect!" });
                return;
            }
            if (!newPassword) {
                res.status(401).json({ success: false, message: "New Password Required!" });
                return;
            }
        }

        const code = randomBytes(3).toString("hex")
        const mailOptions: CreateEmailOptions = {
            from:"service@edugrant.online",
            to:checkAccount.email,
            subject:"Change Login Credentials",
            html: authHTML(code)
        }
        const expiresAt = new Date(Date.now() + 1000 * 60 * 5)
        const send = await SendAuthCode(mailOptions, "studentChangeLoginCredentials", checkAccount.email, code, expiresAt)

        if(!send.success){
            res.status(500).json({success: false, message: "Email Not Sent!"})
            return
        }
        res.status(200).json({success: true, message: "Email Sent!"})
    } catch (error) {
        next(error)
    }
}
export const changeLoginCredentials = async(req: Request, res: Response, next: NextFunction): Promise<void>=> {
    try {
        const {accountId, schoolId, newEmail, oldEmail, oldPassword, newPassword, code} = (req as Request & {validated: changeLoginCredentialsSendAuthCodeZodType}).validated.body
        if(!code){
            res.status(401).json({success: false, message: "Code Required!"})
            return
        }
        
        const checkAccount = await prismaGetAccountById(accountId)
        if(!checkAccount){
            res.status(404).json({success: false, message: "Account Did Not Found!"})
            return
        }
        if (oldEmail && oldEmail !== checkAccount.email) {
            res.status(401).json({ success: false, message: "Old Email Incorrect!" });
            return;
        }
        if (oldEmail && !newEmail) {
            res.status(401).json({ success: false, message: "New Email Required!" });
            return;
        }
        if (oldPassword) {
            const isMatch = await compare(oldPassword, checkAccount.hashedPassword);
            if (!isMatch) {
                res.status(401).json({ success: false, message: "Old Password Incorrect!" });
                return;
            }
            if (!newPassword) {
                res.status(401).json({ success: false, message: "New Password Required!" });
                return;
            }
        }

        const checkCode = await prismaSelectCodeByEmailOrigin(checkAccount.email, "studentChangeLoginCredentials")
        if(!checkCode){
            res.status(401).json({success: false, message: "Invalid Code!"})
            return
        }
        if(new Date(checkCode.dateExpiry).getTime() < Date.now()){
            res.status(401).json({success: false, message: "Code Expired!"})
            return
        }

        const changeAccountLoginCredentials = await prismaUpdateAccountLoginCredentials(accountId, schoolId, newEmail,  newPassword)
        if(!changeAccountLoginCredentials){
            res.status(500).json({success: false, message: "Server Error!"})
            return
        }
        res.status(200).json({success: true, message: "Login Credentials Changed!"})
    } catch (error) {
        next(error)
    }
}