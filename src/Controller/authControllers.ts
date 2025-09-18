import { NextFunction, Request, Response } from "express"
import crypto from "crypto"
import { sign, verify } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { SendAuthCode } from "../Config/Resend"
import { TokenPayload } from "../Types/authControllerTypes";
import { loginAccountsZodType, registerAccountZodType, sendAuthCodeLoginZodType, sendAuthCodeRegisterZodType, tokenValidationZodType } from "../Zod/ZodSchemaUserAuth";
import { authHTML } from "../utils/HTML-AuthCode";
import { deleteAuthCodeEmailOrigin, prismaSelectCodeByEmailOrigin, validateCode } from "../Models/Auth_CodeModels";
import { prismaCheckEmailExist, prismaCheckStudentIdExist, prismaCreateStudentAccount, prismaGetAccountById } from "../Models/AccountModels";

export const registerAccount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const origin = "register";
        const { studentId, studentEmail, studentContact,
            studentFirstName, studentMiddleName, studentLastName, studentGender, studentAddress,
            studentDateofBirth, course, year , section, studentPassword, verificationCode, institute, pwd, indigenous } = (req as Request & {validated: registerAccountZodType}).validated.body;
        const checkCode = await validateCode(verificationCode , studentEmail, origin)
        if(pwd == undefined || indigenous == undefined){
            res.status(422).json({message: "Invalid Boolean Value!"})
            return
        }
        if(!checkCode){
            res.status(400).json({success:false, message:"Invalid Code!!"});
            return;
        }
        const expiryDate = new Date(checkCode.dateExpiry).getTime();
        if(expiryDate < Date.now()){
            res.status(400).json({success:false, message:"Code Expired!!"});
            return;
        }
        const HashedPassword = await bcrypt.hash(studentPassword, 10)
        const newUser = await prismaCreateStudentAccount(studentId, studentEmail, studentContact,
            HashedPassword, studentFirstName, studentMiddleName, studentLastName, studentGender,
            studentDateofBirth, studentAddress, course, year , section, institute, pwd, indigenous );
        if(newUser.accountId === 0){
            res.status(500).json({success: false, message:"Database Error!!"});
            return;
        }
        deleteAuthCodeEmailOrigin(studentEmail, origin)
        res.status(200).json({success: true, message:"Account Created!!!"});
    } catch (error) {
        next(error);
    }
}
export const loginAccounts = async (req: Request, res: Response, next: NextFunction): Promise<void>=> {
    try {
        const origin: string = "login";
        const {studentId, userPassword, code} = (req as Request & {validated: loginAccountsZodType}).validated.body
        
        const user = await prismaCheckStudentIdExist(studentId);
        if(!user){
            res.status(400).json({success: false, message: "Incorrect Information!!"})
            return;
        }
        const checkCode = await validateCode(code, user.email, origin)
        if(!checkCode){
            res.status(401).json({success: false, message: "Invalid Code!!"});
            return;
        }
        const expiryDate = new Date(checkCode.dateExpiry).getTime();
        if(expiryDate < Date.now()){
            res.status(401).json({success: false, message: "Code Expired!"});
            return;
        }
        const isMatch = await bcrypt.compare(userPassword, user.hashedPassword);
        if(!isMatch){
            res.status(500).json({success: false, message: "Wrong Password!!"});
            return
        }
        const deleteCode = await deleteAuthCodeEmailOrigin(user.email, origin);
        if(!deleteCode){
            res.status(500).json({success: false, message: "Server Errror"})
            return;
        }
        const payload = {role: "user", accountId: user.accountId};
        const token = sign(payload, (process.env.JWT_SECRET as any), {expiresIn: "7d"})
        res.cookie("token", token, {
            httpOnly:true,
            secure:process.env.NODE_ENV === "production",
            sameSite:process.env.NODE_ENV === "production"? "none":"lax",
            maxAge:60000 * 60 * 24 * 7,
            path:"/",
            domain:".edugrant.online"
        });
        res.status(200).json({success: true, userData: user})
    } catch (error) {
        next(error);
    }
}
export const sendAuthCodeRegister = async (req: Request, res: Response, next: NextFunction): Promise<void>=> {
    try {
        const origin: string = "register";
        const { studentId, studentEmail, studentContact,
            studentFirstName, studentMiddleName, studentLastName, studentGender, studentAddress,
            studentDateofBirth, course, year , section, studentPassword, pwd, indigenous } = (req as Request & {validated: sendAuthCodeRegisterZodType}).validated.body
        
        const checkIfExistingEmail = await prismaCheckEmailExist(studentEmail)
        if (checkIfExistingEmail > 0) {
            res.status(400).json({ message: "Email Already Exists!!" });
            return;
        }
        const checkExistingCode = await prismaSelectCodeByEmailOrigin(studentEmail, origin);
        if(checkExistingCode){
            const expiryDate = new Date(checkExistingCode.dateExpiry).getTime();
            if(expiryDate > Date.now()){
                res.status(200).json({success: true, message:"Code Already Sent!!"});
                return;
            }
        }
        const sendCode = crypto.randomBytes(3).toString("hex");
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
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
        res.status(200).json({ success: true, message: "Email Sent!!" })
    } catch (error) {
        next(error);
    }
}
export const sendAuthCodeLogin = async(req: Request, res: Response, next: NextFunction): Promise<void>=> {
    try {
        const origin: string = "login";
        const {studentId, userPassword} = (req as Request & {validated: sendAuthCodeLoginZodType}).validated.body
        if(!studentId || !userPassword){
            res.status(400).json({success: false, message:"Fill all Credentials!!"});
            return;
        };
        const checkUserExist = await prismaCheckStudentIdExist(studentId);
        if(!checkUserExist){
            res.status(401).json({success: false, message: "Invalid Student ID/Password!"});
            return;
        }
        const isMatch = await bcrypt.compare(userPassword, checkUserExist.hashedPassword);
        if(!isMatch){
            res.status(401).json({success: false, message:"Invalid Student ID/Password!"});
            return;
        }
        const sendCode = crypto.randomBytes(3).toString("hex");
        const expiresAt = new Date(Date.now() + 2 * 60 * 1000)
        const mailOptions = {
            from: "service@edugrant.online",
            to:checkUserExist.email,
            subject:"Login Code",
            html:authHTML(sendCode)
        }
        const checkExistingCode = await prismaSelectCodeByEmailOrigin(checkUserExist.email, origin);
        if(checkExistingCode){
            const expiryDate = new Date(checkExistingCode.dateExpiry).getTime();
            if(expiryDate > Date.now()){
                res.status(200).json({success: true, message:"Code Already Sent!!"});
                return;
            }
        }
        const SendCode = await SendAuthCode(mailOptions, origin, checkUserExist.email, sendCode, expiresAt)
        if(SendCode.success === false){
            res.status(500).json({success:false, message:"Server Error"})
            return
        }
        res.status(200).json({success: true, message:"Code Send!!"});
    } catch (error) {
        console.log(error)
        next(error);
    }
}
export const tokenValidation = async (req: Request, res: Response, next: NextFunction): Promise<void>=> {
    try {
        const {token} = (req as Request & {validated: tokenValidationZodType}).validated.cookies
        if(!token){
            res.status(401).json({success: false, message: "No Valid Token!"})
            return
        }
        const verifiedUser = verify(token, process.env.JWT_SECRET as string) as TokenPayload
        if(verifiedUser.role !== "user"){
            res.status(403).json({success:false, message:"Access Prohibited!"});
            return;
        }
        const userData = await prismaGetAccountById(parseInt(verifiedUser.accountId))
        res.status(200).json({success: true, userData:userData})
    } catch (error) {
        if ((error as {name: string}).name === "TokenExpiredError" || (error as {name: string}).name === "JsonWebTokenError") {
            res.clearCookie("token", {
                httpOnly:true,
                secure:process.env.NODE_ENV === "production",
                sameSite:process.env.NODE_ENV === "production"? "none":"lax",
                maxAge:60000 * 60 * 24 * 7,
                path:"/",
                domain:".edugrant.online"
            });
            res.status(401).json({ success: false, message: "Invalid or expired token" });
            return;
        }
        next(error);
    }
}