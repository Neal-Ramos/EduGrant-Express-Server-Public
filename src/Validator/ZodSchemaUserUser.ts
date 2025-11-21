import z, { object } from "zod";
import { toDate, toInt, toJSON } from "./Validator";
import { application } from "express";

export const updateStudentInfoZodSchema = z.object({
    body: z.object({
        contactNumber: z.string().min(1).optional(),
        firstName: z.string().min(1).optional(),
        middleName: z.string().min(1).optional(),
        lastName: z.string().min(1).optional(),
        gender: z.string().min(1).optional(),
        address: z.string().min(1).optional(),
        course: z.string().min(1).optional(),
        year: z.string().min(1).optional(),
        section: z.string().min(1).optional(),
        dateOfBirth: toDate().optional(),
        familyBackground: toJSON().optional(),
        pwd: z.string().optional(),
        indigenous: z.string().optional()
    }),
    cookies: z.object({
        token: z.string()
    })
})
export type updateStudentInfoZodType = z.infer<typeof updateStudentInfoZodSchema>

export const updateApplicationZodSchema = z.object({
    body: z.object({
        applicationId: toInt(),
        scholarshipId: toInt()
    })
})
export type updateApplicationZodType = z.infer<typeof updateApplicationZodSchema>

export const readNotificationZodSchema = z.object({
    body: z.object({
        notifiactionId: toInt()
    })
})
export type readNotificationZodType = z.infer<typeof readNotificationZodSchema>

export const sendAuthCodeChangeAccountCredZodSchema = z.object({
    body: z.object({
        oldPassword: z.string().min(8),
        newPassword: z.string().min(8),
    })
})
export type sendAuthCodeChangeAccountCredZodType = z.infer<typeof sendAuthCodeChangeAccountCredZodSchema>

export const changePasswordZodSchema = z.object({
    body: z.object({
        oldPassword: z.string(),
        newPassword: z.string(),
        code: z.string(),
        email: z.string()
    })
})
export type changePasswordZodType = z.infer<typeof changePasswordZodSchema>

export const getFileUrlZodSchema = z.object({
    body: z.object({
        applicationId: toInt(),
        path: z.string()
    })
})
export type getFileUrlZodType = z.infer<typeof getFileUrlZodSchema>

export const downloadApplicationFileZodSchema = z.object({
    body: z.object({
        applicationId: toInt(),
        path: z.string()
    })
})
export type downloadApplicationFileZodType = z.infer<typeof downloadApplicationFileZodSchema>
