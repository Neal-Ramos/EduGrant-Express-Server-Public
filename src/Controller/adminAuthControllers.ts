import { NextFunction, Request, Response } from "express";
import { SendAuthCode } from "../Config/Resend"
import { sign } from "jsonwebtoken";
import { compare, hash } from "bcryptjs";
import { adminCodeAuthenticationZodType, adminLoginZodType, createAccountZodType, forgetPassZodType, sendAuthCodeForgetPassZodType } from "../Zod/ZodSchemanAdminAuth";
import { authHTML } from "../utils/HTML-AuthCode";
import { getStaffByEmail, prismaCheckEmailExist, prismaCreateISPSU_Staff, prismaUpdateAccountPassword } from "../Models/AccountModels";
import { GenerateCode } from "../Config/CodeGenerator";
import { CreateEmailOptions } from "resend";
import { AuthCode } from "../Models/Auth_CodeModels";

export const adminLogIn = async (req:Request, res: Response, next: NextFunction): Promise<void>=> {
    try {
        const {adminEmail, adminPassword} = (req as Request & {validated: adminLoginZodType}).validated.body

        const correctCredenatials = await getStaffByEmail(adminEmail)
        if(!correctCredenatials || correctCredenatials.role === "Student"){
          res.status(401).json({success:false, message:"Invalid Credentials"});
          return;
        }
        if(!correctCredenatials.ISPSU_Staff?.validated && correctCredenatials.role === "ISPSU_Staff"){
          res.status(401).json({success:false, message:"Account Not Validated!"});
          return;
        }

        const validatePassword = await compare(adminPassword, correctCredenatials.hashedPassword)
        if(!validatePassword){
          res.status(401).json({success:false, message:"Invalid Credentials"});
          return;
        }
        const Code = await AuthCode.Find(adminEmail, "adminLogin")
        if(Code){
          const {validated} = await AuthCode.validate(Code.code, Code.owner, Code.origin)
          if(validated){
              res.status(200).json({success: true, message:"Code Already Sent!!"});
              return;
          }
        }
        const sendCode = await GenerateCode(6)
        const expiresAt = new Date(Date.now() + 2 * 60 * 1000);
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
        res.status(200).json({ success: true, message: "Email Sent!!", expiresAt, ttl: 120, resendAvailableIn: 60});
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
        const Code = await AuthCode.validate(code, adminEmail, "adminLogin");// check the code
        if(!Code.validated){
            res.status(401).json({success:false, message:Code.message});
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
        await AuthCode.DeleteAll(adminEmail, "adminLogin");

        const {hashedPassword, ...safeData} = validAccount
        res.status(200).json({success:true, message:"Login Success!", role:validAccount.role, safeData:safeData})
    } catch (error) {
        next(error)
    }
};

export const sendAuthCodeForgetPass = async (req: Request, res: Response, next: NextFunction): Promise<void>=> {
  try {
    const {email} = (req as Request & {validated: sendAuthCodeForgetPassZodType}).validated.body

    const checkAccount = await prismaCheckEmailExist(email)
    if(!checkAccount || checkAccount.role === "Student"){
      res.status(404).json({success: false, message: "Email does not Exist!"})
      return
    }

    const code = await GenerateCode(6)
    const expiresAt = new Date(Date.now() + (2 * 60 * 1000))
    const mailOptions: CreateEmailOptions = {
        from: "service@edugrant.online",
        to: checkAccount.email,
        subject: "Change Password!",
        html:authHTML(code)
    }
    const sendCode = await SendAuthCode(mailOptions, "ISPSU_ForgetPassword", checkAccount.email, code, expiresAt)
    if(!sendCode.success){
        res.status(500).json({success: false, messagel: "Email Not Sent!"})
        return
    }
    res.status(200).json({success: true, message: "Email Sent!", expiresAt, ttl: 120, resendAvailableIn: 60})
  } catch (error) {
    next(error)
  }
}
export const forgetPass = async (req: Request, res: Response, next: NextFunction): Promise<void>=> {
  try {
    const {email, newPassword, code} = (req as Request & {validated: forgetPassZodType}).validated.body

    const checkAccount = await prismaCheckEmailExist(email)
    if(!checkAccount || checkAccount.role !== "Student"){
      res.status(404).json({success: false, message: "Email does not Exist!"})
      return
    }

    const Code = await AuthCode.validate(code, email, "ISPSU_ForgetPassword")
    if(!Code.validated){
      res.status(404).json({success: false, message: Code.message})
      return
    }

    const newHashedPass = await hash(newPassword, 10)
    const changePass = await prismaUpdateAccountPassword(email, newHashedPass)

    if(!changePass){
      res.status(500).json({success: false, message: "Server Error!"})
      return
    }
    res.status(200).json({success: true, message: "Password Changed!"})
  } catch (error) {
    next(error)
  }
}