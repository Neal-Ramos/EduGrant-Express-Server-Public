import z from 'zod';
import { toInt } from './Validator';

export const adminLogoutZodSchema = z.object({
  cookies: z.object({
    AdminToken: z.string(),
  }),
});
export type adminLogoutZodType = z.infer<typeof adminLogoutZodSchema>;

export const editHeadZodSchema = z.object({
  body: z.object({
    address: z.string().min(1).optional(),
    fName: z.string().min(1).optional(),
    lName: z.string().min(1).optional(),
    mName: z.string().min(1).optional(),
    gender: z.string().min(1).optional(),
  }),
});
export type editHeadZodType = z.infer<typeof editHeadZodSchema>;

export const editStaffZodSchema = z.object({
  body: z.object({
    ownerId: toInt(),
    fName: z.string().min(1).optional(),
    lName: z.string().min(1).optional(),
    mName: z.string().optional(),
    email: z.email().optional(),
    password: z.string().min(8).optional(),
    validate: z.string().optional(),
  }),
});
export type editStaffZodType = z.infer<typeof editStaffZodSchema>;

export const editStaffInfoZodSchema = z.object({
  body: z.object({
    fName: z.string().min(1).optional(),
    lName: z.string().min(1).optional(),
    mName: z.string().min(1).optional(),
  }),
});
export type editStaffInfoZodType = z.infer<typeof editStaffInfoZodSchema>;

export const editStaffCredSendAuthCodeZodSchema = z.object({
  body: z.object({
    newEmail: z.email().min(1).optional(),
    oldPass: z.string().min(8).optional(),
    newPass: z.string().min(8).optional(),
  }),
});
export type editStaffCredSendAuthCodeZodType = z.infer<typeof editStaffCredSendAuthCodeZodSchema>;

export const changeStaffCredZodSchema = z.object({
  body: z.object({
    code: z.string(),
    newEmail: z.email().optional(),
    oldPass: z.string().min(8).optional(),
    newPass: z.string().min(8).optional(),
  }),
});
export type changeStaffCredZodType = z.infer<typeof changeStaffCredZodSchema>;

export const updateTourZodSchema = z.object({
  body: z.object({
    dashboardTour: z.string(),
  }),
});
export type updateTourZodType = z.infer<typeof updateTourZodSchema>;
