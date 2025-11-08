import { Request , NextFunction , Response } from "express";
import { verify } from "jsonwebtoken";
import { TokenPayload } from "../Types/adminAuthControllerTypes";

export const cookieOptionsStudent:{
    httpOnly: boolean,
    secure: boolean,
    sameSite: "none"|"lax",
    maxAge: number,
    path: string,
    domain: string,
} = {
    httpOnly:true,
    secure:process.env.NODE_ENV === "production",
    sameSite:process.env.NODE_ENV === "production"? "none":"lax",
    maxAge:60000 * 60 * 24 * 7,
    path:"/",
    domain:".edugrant.online"
}
export const cookieOptionsStaff: {
    httpOnly: boolean,
    secure: boolean,
    sameSite: "none"|"lax",
    maxAge: number,
    path: string,
    domain: string,
} = {
    httpOnly:true,
    secure:process.env.NODE_ENV === "production",
    sameSite:process.env.NODE_ENV === "production"? "none":"lax",
    maxAge:60000 * 60 * 24 * 7,
    path:"/administrator",
    domain:".edugrant.online"
}

export const TokenAuth = (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies.token;
        if(!token){
            res.status(401).json({success: false, message: "Access Prohibited!!!"})
            return;
        }
        const valid = verify(token, process.env.JWT_SECRET as string) as TokenPayload;
        if(valid.role !== "Student"){
            throw new Error("Invalid Role")
        }
        req.tokenPayload = valid
        next()
    } catch (error) {
        if ((error as {name: string}).name === "TokenExpiredError" || 
        (error as {name: string}).name === "JsonWebTokenError" || 
        (error as {message: string}).message === "Invalid Role") {
            res.clearCookie("token", cookieOptionsStudent);
            res.status(401).json({ success: false, message: "Invalid or expired token" });
            return;
        }
        res.status(401).json({ success: false, message: "Invalid or expired token." });
        return;
    }
}
export const AdminTokenAuth = (req: Request, res: Response, next: NextFunction) => {
    try {
        // const token = req.cookies.AdminToken;
        // if(!token){
        //     res.status(401).json({success: false, message: "Access Prohibited!!!"})
        //     return;
        // }
        // const valid = verify(token, process.env.JWT_SECRET as string) as TokenPayload;
        // if(!["ISPSU_Head", "ISPSU_Staff"].includes(valid.role)){
        //     throw new Error("Invalid Role")
        // }
        // req.tokenPayload = valid
        next()
    } catch (error) {
        if ((error as {name: string}).name === "TokenExpiredError" || 
        (error as {name: string}).name === "JsonWebTokenError" || 
        (error as {message: string}).message === "Invalid Role") {
            res.clearCookie("AdminToken", cookieOptionsStaff)
            res.status(401).json({ success: false, message: "Invalid or expired token" });
            return;
        }
        res.status(401).json({ success: false, message: "Invalid or expired token." });
        return;
    }
}