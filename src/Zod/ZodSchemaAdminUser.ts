import z from "zod";
import { toInt } from "./Validator";

export const adminLogoutZodSchema = z.object({
    cookies: z.object({
        AdminToken: z.string()
    })
})
export type adminLogoutZodType = z.infer<typeof adminLogoutZodSchema>

export const editHeadZodSchema = z.object({
    body: z.object({
        address: z.string().optional(),
        fName: z.string().optional(),
        lName: z.string().optional(),
        mName: z.string().optional(),
        gender: z.string().optional(),
    })
})
export type editHeadZodType = z.infer<typeof editHeadZodSchema>

export const editStaffZodSchema = z.object({
    body: z.object({
        ownerId: toInt(),
        fName: z.string().optional(),
        lName: z.string().optional(),
        mName: z.string().optional(),
        email: z.string().optional(),
        password: z.string().optional(),
        validate: z.string().optional()
    })
})
export type editStaffZodType = z.infer<typeof editStaffZodSchema>

export const editStaffInfoZodSchema = z.object({
    body: z.object({
        fName: z.string().optional(),
        lName: z.string().optional(),
        mName: z.string().optional(),
    })
})
export type editStaffInfoZodType = z.infer<typeof editStaffInfoZodSchema>

export const editStaffCredSendAuthCodeZodSchema = z.object({
    body: z.object({
        newEmail: z.string().optional(),
        oldPass: z.string().optional(),
        newPass: z.string().optional()
    })
})
export type editStaffCredSendAuthCodeZodType = z.infer<typeof editStaffCredSendAuthCodeZodSchema>

export const changeStaffCredZodSchema = z.object({
    body: z.object({
        code: z.string(),
        newEmail: z.string().optional(),
        oldPass: z.string().optional(),
        newPass: z.string().optional()
    })
})
export type changeStaffCredZodType = z.infer<typeof changeStaffCredZodSchema>

export const updateTourZodSchema = z.object({
    body: z.object({
        dashboardTour: z.string()
    })
})
export type updateTourZodType = z.infer<typeof updateTourZodSchema>