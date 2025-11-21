import { z } from 'zod';

export const createAccountZodSchema = z.object({
  body: z.object({
    email: z.email().trim(),
    firstName: z.string().trim().min(1),
    middleName: z.string().trim().min(1).optional(),
    lastName: z.string().trim().min(1),
    phone: z.string().trim().min(10),
    password: z.string().trim().min(8),
  }),
});
export type createAccountZodType = z.infer<typeof createAccountZodSchema>;

export const adminLoginZodSchema = z.object({
  body: z.object({
    adminEmail: z.string(),
    adminPassword: z.string(),
  }),
});
export type adminLoginZodType = z.infer<typeof adminLoginZodSchema>;

export const adminCodeAuthenticationZodSchema = z.object({
  body: z.object({
    code: z.string(),
    adminPassword: z.string(),
    adminEmail: z.string(),
  }),
});
export type adminCodeAuthenticationZodType = z.infer<typeof adminCodeAuthenticationZodSchema>;

export const adminTokenAuthenticationZodSchema = z.object({
  cookies: z.object({
    AdminToken: z.string().optional(),
  }),
});
export type adminTokenAuthenticationZodType = z.infer<typeof adminTokenAuthenticationZodSchema>;

export const sendAuthCodeForgetPassZodSchema = z.object({
  body: z.object({
    email: z.email().trim(),
  }),
});
export type sendAuthCodeForgetPassZodType = z.infer<typeof sendAuthCodeForgetPassZodSchema>;

export const forgetPassZodSchema = z.object({
  body: z.object({
    email: z.string(),
    newPassword: z.string(),
    code: z.string(),
  }),
});
export type forgetPassZodType = z.infer<typeof forgetPassZodSchema>;

export const superAdminTokenAuthenticationZodSchema = z.object({
  cookies: z.object({
    AdminToken: z.string(),
  }),
});
export type superAdminTokenAuthenticationZodType = z.infer<typeof superAdminTokenAuthenticationZodSchema>;
