import z, { boolean, email } from "zod";
import { toBoolean, toDate } from "./Validator";

export const registerAccountZodSchema = z.object({
  body: z.object({
    studentId: z.string().trim().min(1),
    studentEmail: z.email().trim(),
    studentContact: z.string().trim().min(10),
    studentFirstName: z.string().trim().min(1),
    studentMiddleName: z.string().trim().min(1).optional(),
    studentLastName: z.string().trim().min(1),
    studentGender: z.string().trim().min(1),
    studentAddress: z.string().trim().min(1),
    institute: z.string().trim().min(1),
    course: z.string().trim().min(1),
    year: z.string().trim().min(1),
    section: z.string().trim().min(1),
    pwd: z.string().trim().optional(),
    indigenous: z.string().trim().optional(),
    studentPassword: z.string().trim().min(8),
    studentDateofBirth: toDate(),
    prefixName: z.string().optional(),
    fourPs: toBoolean(),
    dswd: toBoolean(),
    civilStatus: z.string(),
    studentType: z.string(),
    verificationCode: z.string().trim(),
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
    studentId: z.string().min(1).trim(),
    studentEmail: z.email().trim(),
    studentContact: z.string().min(10).trim(),
    studentFirstName: z.string().min(1).trim(),
    studentMiddleName: z.string().min(1).trim().optional(),
    studentLastName: z.string().min(1).trim(),
    studentGender: z.string().min(1).trim(),
    studentAddress: z.string().min(1).trim(),
    institute: z.string().min(1).trim(),
    course: z.string().min(1).trim(),
    year: z.string().min(1).trim(),
    section: z.string().min(1).trim(),
    pwd: z.string().trim().optional(),
    indigenous: z.string().trim().optional(),
    prefixName: z.string().optional(),
    fourPs: toBoolean(),
    dswd: toBoolean(),
    civilStatus: z.string(),
    studentType: z.string(),
    studentPassword: z.string().trim().min(8),
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

export const forgotPasswordZodSchema = z.object({
  body: z.object({
    newPassword: z.string().min(8),
    email: z.email(),
    code: z.string()
  })
})
export type forgotPasswordZodType = z.infer<typeof forgotPasswordZodSchema>

export const forgotPasswordSendAuthCodeZodSchema = z.object({
  body: z.object({
    email: z.email(),
  })
})
export type forgotPasswordSendAuthCodeZodType = z.infer<typeof forgotPasswordSendAuthCodeZodSchema>