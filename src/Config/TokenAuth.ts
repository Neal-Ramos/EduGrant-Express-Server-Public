import { Request , NextFunction , Response } from "express";
import { verify } from "jsonwebtoken";
import { TokenPayload } from "../Types/adminAuthControllerTypes";

export const TokenAuth = (req: Request, res: Response, next: NextFunction) => {
    try {
        // const token = req.cookies.token;
        // if(!token){
        //     res.status(401).json({success: false, message: "Access Prohibited!!!"})
        //     return;
        // }
        // const valid = verify(token, process.env.JWT_SECRET as string) as TokenPayload;
        // if(valid.role !== "user"){
        //     res.status(401).json({success:false, message:"Access Prohibited!"});
        //     return
        // }
        next()
    } catch (error) {
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
        // if(!["admin", "superAdmin"].includes(valid.role)){
        //     res.status(401).json({success:false, message:"Access Prohibited!"});
        //     return
        // }
        next()
    } catch (error) {
        res.status(401).json({ success: false, message: "Invalid or expired token." });
        return;
    }
}