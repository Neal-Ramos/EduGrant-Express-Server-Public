import z, { boolean, email } from "zod";
import { toDate } from "./Validator";

export const registerAccountZodSchema = z.object({
  body: z.object({
    studentId: z.string().min(1),
    studentEmail: z.email(),
    studentContact: z.string().min(10),
    studentFirstName: z.string().min(1),
    studentMiddleName: z.string().min(1).optional(),
    studentLastName: z.string().min(1),
    studentGender: z.string().min(1),
    studentAddress: z.string().min(1),
    institute: z.string().min(1),
    course: z.string().min(1),
    year: z.string().min(1),
    section: z.string().min(1),
    pwd: z.string().optional(),
    indigenous: z.string().optional(),
    studentPassword: z.string().min(8),
    studentDateofBirth: toDate(),
    verificationCode: z.string(),
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
    studentId: z.string().min(1),
    studentEmail: z.email(),
    studentContact: z.string().min(10),
    studentFirstName: z.string().min(1),
    studentMiddleName: z.string().min(1).optional(),
    studentLastName: z.string().min(1),
    studentGender: z.string().min(1),
    studentAddress: z.string().min(1),
    institute: z.string().min(1),
    course: z.string().min(1),
    year: z.string().min(1),
    section: z.string().min(1),
    pwd: z.string().optional(),
    indigenous: z.string().optional(),
    studentPassword: z.string().min(8),
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