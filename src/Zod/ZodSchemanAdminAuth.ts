import {z} from "zod";

export const createAccountZodSchema = z.object({
    body: z.object({
        email: z.email(),
        firstName: z.string(),
        middleName: z.string().optional(),
        lastName: z.string(),
        phone: z.string(),
        password: z.string(),
    })
})
export type createAccountZodType = z.infer<typeof createAccountZodSchema>

export const adminLoginZodSchema = z.object({
    body: z.object({
        adminEmail:z.string(),
        adminPassword:z.string()
    })
})
export type adminLoginZodType = z.infer<typeof adminLoginZodSchema>

export const adminCodeAuthenticationZodSchema = z.object({
    body: z.object({
        code: z.string(),
        adminPassword: z.string(),
        adminEmail: z.string(),
    })
})
export type adminCodeAuthenticationZodType = z.infer<typeof adminCodeAuthenticationZodSchema>

export const adminTokenAuthenticationZodSchema = z.object({
    cookies: z.object({
        AdminToken: z.string().optional()
    })
})
export type adminTokenAuthenticationZodType = z.infer<typeof adminTokenAuthenticationZodSchema>

export const superAdminTokenAuthenticationZodSchema = z.object({
    cookies: z.object({
        AdminToken: z.string()
    })
})
export type superAdminTokenAuthenticationZodType = z.infer<typeof superAdminTokenAuthenticationZodSchema>