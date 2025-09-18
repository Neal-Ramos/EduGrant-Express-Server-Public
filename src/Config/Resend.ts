import { CreateEmailOptions, Resend } from "resend";
import { prismaCreateAuthCode } from "../Models/Auth_CodeModels";

const resend = new Resend(process.env.RESEND_API_KEY)

export const SendAuthCode = async (mailOptions: CreateEmailOptions, origin: string, adminEmail: string, sendCode: string, expiresAt: Date): Promise<{success: boolean, message: string}>=>{
    try {
        const {data, error} = await resend.emails.send(mailOptions)
        if(error){
            console.log(error)
            return {success: false, message:"Resend Error!" + error?.message}
        }
        const insertAuthCode = await prismaCreateAuthCode(origin, adminEmail, sendCode, expiresAt) 
        if(!insertAuthCode){
            return {success: false, message: "Database Error!"}
        }
        return {success: true, message:"Email Sent!"}
    } catch (error: any) {
        console.log("Unexpected Error" + error)
        return { success: false, message: "Unexpected Error: " + error?.message }
    }
}
export const sendAdminRegValidation = async (mailOptions: CreateEmailOptions): Promise<{success: boolean, message: string}>=> {
    try {
        const {data, error} = await resend.emails.send(mailOptions)
        if(error){
            console.log(error)
            return {success: false, message:"Resend Error!" + error?.message}
        }
        return {success: true, message:"Email Sent!"}
    } catch (error: any) {
        console.log("Unexpected Error" + error)
        return { success: false, message: "Unexpected Error: " + error?.message }
    }
}
export const sendApplicationUpdate = async(mailOptions: CreateEmailOptions): Promise<{success: boolean, message: string}>=> {
    try {
        const {data, error} = await resend.emails.send(mailOptions)
        if(error){
            console.log(error)
            return {success: false, message:"Resend Error!" + error?.message}
        }
        return {success: true, message:"Email Sent!"}
    } catch (error: any) {
        console.log("Unexpected Error" + error)
        return { success: false, message: "Unexpected Error: " + error?.message }
    }
}