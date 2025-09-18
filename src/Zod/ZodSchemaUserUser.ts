import z, { object } from "zod";
import { toDate, toInt, toJSON } from "./Validator";


export const logoutZodSchema = z.object({
    cookies: z.object({

    })
})
export type logoutZodType = z.infer<typeof logoutZodSchema>

export const updateStudentInfoZodSchema = z.object({
    body: z.object({
        accountId: toInt(),
        contactNumber: z.string().optional(),
        firstName: z.string().optional(),
        middleName: z.string().optional(),
        lastName: z.string().optional(),
        gender: z.string().optional(),
        address: z.string().optional(),
        course: z.string().optional(),
        year: z.string().optional(),
        section: z.string().optional(),
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
        accountId: toInt(),
        applicationId: toInt(),
        scholarshipId: z.string()
    })
})
export type updateApplicationZodType = z.infer<typeof updateApplicationZodSchema>

export const changeLoginCredentialsSendAuthCodeZodSchema = z.object({
    body: z.object({
        accountId: toInt(),
        schoolId: z.string().optional(),
        newEmail: z.string().optional(),
        oldEmail: z.string().optional(),
        oldPassword: z.string().optional(),
        newPassword: z.string().optional(),
        code: z.string().optional()
    })
})
export type changeLoginCredentialsSendAuthCodeZodType = z.infer<typeof changeLoginCredentialsSendAuthCodeZodSchema>