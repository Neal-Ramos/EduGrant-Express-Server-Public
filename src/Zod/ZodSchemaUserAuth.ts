import z, { boolean, email } from "zod";
import { toDate } from "./Validator";

export const registerAccountZodSchema = z.object({
  body: z.object({
    studentId: z.string(),
    studentEmail: z.string(),
    studentContact: z.string(),
    studentFirstName: z.string(),
    studentMiddleName: z.string().optional(),
    studentLastName: z.string(),
    studentGender: z.string(),
    studentAddress: z.string(),
    institute: z.string(),
    course: z.string(),
    year: z.string(),
    section: z.string(),
    pwd: z.string().optional(),
    indigenous: z.string().optional(),
    studentPassword: z.string(),
    verificationCode: z.string(),
    studentDateofBirth: toDate(),
  }),
});
export type registerAccountZodType = z.infer<typeof registerAccountZodSchema>;

export const loginAccountsZodSchema = z.object({
  body: z.object({
    studentId: z.string(),
    userPassword: z.string(),
    code: z.string(),
  }),
});
export type loginAccountsZodType = z.infer<typeof loginAccountsZodSchema>;

export const sendAuthCodeRegisterZodSchema = z.object({
  body: z.object({
    studentId: z.string(),
    studentEmail: z.string(),
    studentContact: z.string(),
    studentFirstName: z.string(),
    studentMiddleName: z.string(),
    studentLastName: z.string(),
    studentGender: z.string(),
    studentAddress: z.string(),
    institute: z.string(),
    course: z.string(),
    year: z.string(),
    section: z.string(),
    pwd: z.string(),
    indigenous: z.string(),
    studentPassword: z.string(),
    studentDateofBirth: toDate(),
  }),
});
export type sendAuthCodeRegisterZodType = z.infer<
  typeof sendAuthCodeRegisterZodSchema
>;

export const sendAuthCodeLoginZodSchema = z.object({
  body: z.object({
    studentId: z.string(),
    userPassword: z.string(),
  }),
});
export type sendAuthCodeLoginZodType = z.infer<
  typeof sendAuthCodeLoginZodSchema
>;

export const tokenValidationZodSchema = z.object({
  cookies: z.object({
    token: z.string().optional()
  })
})
export type tokenValidationZodType = z.infer<typeof tokenValidationZodSchema>

export const forgotPasswordZodSchema = z.object({
  body: z.object({
    newPassword: z.string(),
    email: z.string(),
    code: z.string()
  })
})
export type forgotPasswordZodType = z.infer<typeof forgotPasswordZodSchema>

export const forgotPasswordSendAuthCodeZodSchema = z.object({
  body: z.object({
    email: z.string(),
  })
})
export type forgotPasswordSendAuthCodeZodType = z.infer<typeof forgotPasswordSendAuthCodeZodSchema>