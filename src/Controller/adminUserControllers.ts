import { NextFunction, Request, Response } from "express";
import { adminLogoutZodType } from "../Zod/ZodSchemaAdminUser";

export const adminLogout = async (req: Request, res: Response, next: NextFunction): Promise<void>=> {
    try {
        const {AdminToken} = (req as Request & {validated: adminLogoutZodType}).validated.cookies
        res.clearCookie("AdminToken", { 
            httpOnly:true,
            secure:process.env.NODE_ENV === "production",
            sameSite:process.env.NODE_ENV === "production"? "none":"lax",
            maxAge:60000 * 60 * 24 * 7,
            path:"/administrator",
            domain:".edugrant.online"
        });
        res.status(200).json({ success: true, message: "Log out successfully!" });
    } catch (error) {
        next(error);
    }
};