import z from "zod";

export const adminLogoutZodSchema = z.object({
    cookies: z.object({
        AdminToken: z.string()
    })
})
export type adminLogoutZodType = z.infer<typeof adminLogoutZodSchema>