import { NextFunction, Request, Response } from "express"
import crypto from "crypto"
import { sign, verify } from "jsonwebtoken";
import bcrypt, { hash } from "bcryptjs";
import { SendAuthCode } from "../Config/Resend"
import { TokenPayload } from "../Types/authControllerTypes";
import { forgotPasswordSendAuthCodeZodType, forgotPasswordZodType, loginAccountsZodType, registerAccountZodType, sendAuthCodeLoginZodType, sendAuthCodeRegisterZodType } from "../Zod/ZodSchemaUserAuth";
import { authHTML } from "../utils/HTML-AuthCode";
import { prismaCheckEmailExist, prismaCheckStudentIdExist, prismaCreateStudentAccount, prismaGetAccountById, prismaUpdateAccountPassword } from "../Models/AccountModels";
import { GenerateCode } from "../Config/CodeGenerator";
import { CreateEmailOptions } from "resend";
import { prismaGetUnreadNotificationsCount } from "../Models/Student_NotificationModels";
import { AuthCode } from "../Models/Auth_CodeModels";
import { prismaGetAllAnnouncement } from "../Models/AnnouncementModels";
import { getAnnouncementsZodType } from "../Zod/ZodSchemaUserPost";

export const registerAccount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const origin = "register";
        const { studentId, studentEmail, studentContact,
            studentFirstName, studentMiddleName, studentLastName, studentGender, studentAddress,
            studentDateofBirth, course, year , section, studentPassword, verificationCode, institute, pwd, indigenous } = (req as Request & {validated: registerAccountZodType}).validated.body;
        const Code = await AuthCode.validate(verificationCode , studentEmail, origin)
        if(!Code.validated || !Code.AuthCode){
            res.status(400).json({success:false, message:Code.message});
            return;
        }
        const checkIfExistingEmail = await prismaCheckEmailExist(studentEmail)
        if (checkIfExistingEmail) {
            res.status(400).json({ message: "Email Already Exists!!" });
            return;
        }
        const CheckStudentIdExist = await prismaCheckStudentIdExist(studentId)
        if(CheckStudentIdExist){
            res.status(400).json({success: false, message: "Student Id Already Exist!"})
            return
        }
        const HashedPassword = await bcrypt.hash(studentPassword, 10)
        const newUser = await prismaCreateStudentAccount(studentId, studentEmail, studentContact,
            HashedPassword, studentFirstName, studentMiddleName, studentLastName, studentGender,
            studentDateofBirth, studentAddress, course, year , section, institute, pwd, indigenous );
        if(newUser.accountId === 0){
            res.status(500).json({success: false, message:"Database Error!!"});
            return;
        }
        await AuthCode.DeleteAll(studentEmail, origin)
        res.status(200).json({success: true, message:"Account Created!!!"});
        await AuthCode.DeleteAll(studentEmail, Code.AuthCode.origin)
    } catch (error) {
        next(error);
    }
}
export const loginAccounts = async (req: Request, res: Response, next: NextFunction): Promise<void>=> {
    try {
        const origin: string = "login";
        const {studentId, userPassword, code} = (req as Request & {validated: loginAccountsZodType}).validated.body
        
        const Student = await prismaCheckStudentIdExist(studentId);
        if(!Student){
            res.status(400).json({success: false, message: "Incorrect Information!!"})
            return;
        }
        const Code = await AuthCode.validate(code, Student.email, origin)
        if(!Code.validated || !Code.AuthCode){
            res.status(400).json({success: false, message: Code.message});
            return;
        }
        await AuthCode.DeleteAll(Student.email, origin);
        const isMatch = await bcrypt.compare(userPassword, Student.hashedPassword);
        if(!isMatch){
            res.status(500).json({success: false, message: "Wrong Password!!"});
            return
        }

        const payload = {role: "Student", accountId: Student.accountId};
        const token = sign(payload, (process.env.JWT_SECRET as any), {expiresIn: "7d"})
        res.cookie("token", token, {
            httpOnly:true,
            secure:process.env.NODE_ENV === "production",
            sameSite:process.env.NODE_ENV === "production"? "none":"lax",
            maxAge:60000 * 60 * 24 * 7,
            path:"/",
            domain:".edugrant.online"
        });
        const {hashedPassword, ...safeData} = Student
        const unreadNotifications = await prismaGetUnreadNotificationsCount(Student.accountId)
        res.status(200).json({success: true, userData: safeData, unreadNotifications})
        await AuthCode.DeleteAll(Student.email, Code.AuthCode.origin)
    } catch (error) {
        next(error);
    }
}
export const sendAuthCodeRegister = async (req: Request, res: Response, next: NextFunction): Promise<void>=> {
    try {
        const origin: string = "register";
        const { studentId, studentEmail} = (req as Request & {validated: sendAuthCodeRegisterZodType}).validated.body
        
        const checkIfExistingEmail = await prismaCheckEmailExist(studentEmail)
        if (checkIfExistingEmail) {
            res.status(400).json({ message: "Email Already Exists!!" });
            return;
        }
        const CheckStudentIdExist = await prismaCheckStudentIdExist(studentId)
        if(CheckStudentIdExist){
            res.status(400).json({success: false, message: "Student Id Already Exist!"})
            return
        }
        const Code = await AuthCode.Find(studentEmail, origin);
        if(Code){
            const {validated} = await AuthCode.validate(Code.code, Code.owner, Code.origin)
            if(validated){
                const resendAvailableIn = (new Date(Code.dateExpiry).getTime() - new Date().getTime()) / 1000
                res.status(200).json({success: true, message: "Email Already Sent", expiresAt: Code.dateExpiry, ttl:120, resendAvailableIn});
                return;
            }
        }
        const sendCode = await GenerateCode(6)
        const expiresAt = new Date(Date.now() + 2 * 60 * 1000);
        const mailOptions = {
            from: "service@edugrant.online",
            to: studentEmail,
            subject: "Registration Code",
            html:authHTML(sendCode)
        };
        const SendMail = await SendAuthCode(mailOptions, origin, studentEmail, sendCode, expiresAt)
        if(SendMail.success === false){
            res.status(500).json({success:false, message:"Email Not Sent!!"});
            return;
        }
        res.status(200).json({ success: true, message: "Email Sent!!", expiresAt, ttl:120, resendAvailableIn: 60})
    } catch (error) {
        next(error);
    }
}
export const sendAuthCodeLogin = async(req: Request, res: Response, next: NextFunction): Promise<void>=> {
    try {
        const origin: string = "login";
        const {studentId, userPassword} = (req as Request & {validated: sendAuthCodeLoginZodType}).validated.body

        const checkUserExist = await prismaCheckStudentIdExist(studentId);
        if(!checkUserExist || checkUserExist.role !== "Student"){
            res.status(400).json({success: false, message: "Invalid Student ID/Password!"});
            return;
        }
        const isMatch = await bcrypt.compare(userPassword, checkUserExist.hashedPassword);
        if(!isMatch){
            res.status(400).json({success: false, message:"Invalid Student ID/Password!"});
            return;
        }
        const sendCode = await GenerateCode(6)
        const expiresAt = new Date(Date.now() + 2 * 60 * 1000)
        const mailOptions = {
            from: "service@edugrant.online",
            to:checkUserExist.email,
            subject:"Login Code",
            html:authHTML(sendCode)
        }
        const Code = await AuthCode.Find(checkUserExist.email, origin);
        if(Code){
            const {validated} = await AuthCode.validate(Code.code, Code.owner, Code.origin)
            if(validated){
                const resendAvailableIn = (new Date(Code.dateExpiry).getTime() - new Date().getTime()) / 1000
                res.status(200).json({success: true, message: "Code Already Sent!", expiresAt: Code.dateExpiry, ttl: 120, resendAvailableIn});
                return;
            }
        }
        const SendCode = await SendAuthCode(mailOptions, origin, checkUserExist.email, sendCode, expiresAt)
        if(SendCode.success === false){
            res.status(500).json({success:false, message:"Server Error"})
            return
        }
        res.status(200).json({success: true, message:"Code Send!!", expiresAt, ttl: 120, resendAvailableIn: 60});
    } catch (error) {
        console.log(error)
        next(error);
    }
}
export const forgotPassword = async(req: Request, res: Response, next: NextFunction): Promise<void>=> {
    try {
        const {email, newPassword, code} = (req as Request & {validated: forgotPasswordZodType}).validated.body
        const Code = await AuthCode.validate(code, email, "forgotPassword")
        if(!Code.validated || !Code.AuthCode){
            res.status(400).json({success: false, message: Code.message})
            return
        }

        const hashed = await hash(newPassword, 10)
        const updateAccountPassword = await prismaUpdateAccountPassword(email, hashed)
        if(!updateAccountPassword){
            res.status(500).json({success: false, message: "Something Went Wrong!"})
            return
        }
        const {hashedPassword ,...userAccount} = updateAccountPassword
        res.status(200).json({success: true, message: "Password Changed!", userAccount})
        await AuthCode.DeleteAll(updateAccountPassword.email, Code.AuthCode.origin)
    } catch (error) {
        next(error)
    }
}
export const forgotPasswordSendAuthCode = async(req: Request, res: Response, next: NextFunction): Promise<void>=> {
    try {
        const {email} = (req as Request & {validated: forgotPasswordSendAuthCodeZodType}).validated.body
        const origin = "forgotPassword"
        const Code = await AuthCode.Find(email, origin)
        if(Code){
            const {validated} = await AuthCode.validate(Code.code, email, origin)
            if(validated){
                const resendAvailableIn = (new Date(Code.dateCreated).getTime() - new Date().getTime()) / 1000
                res.status(400).json({success: false, message: "Email Already Sent!", expiresAt: Code.dateExpiry, ttl: 120, resendAvailableIn})
                return
            }
        }
        const checkEmail = await prismaCheckEmailExist(email)
        if(!checkEmail || checkEmail.role !== "Student"){
            res.status(400).json({success: false, message: "Account Did Not Found!"})
            return
        }
        const code = await GenerateCode(6)
        const expiresAt = new Date(Date.now() + (2 * 60 * 1000))
        const mailOptions: CreateEmailOptions = {
            from: "service@edugrant.online",
            to: checkEmail.email,
            subject: "Change Password!",
            html:authHTML(code)
        }
        const sendCode = await SendAuthCode(mailOptions, origin, checkEmail.email, code, expiresAt)
        if(!sendCode.success){
            res.status(500).json({success: false, messagel: "Email Not Sent!"})
            return
        }
        res.status(200).json({success: true, message: "Email Sent!", expiresAt, ttl: 120, resendAvailableIn: 60})
    } catch (error) {
        next(error)
    }
}