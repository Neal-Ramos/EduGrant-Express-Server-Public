import { Router } from "express";
import { adminLogout, changeStaffCred, editHead, editStaff, editStaffCredSendAuthCode, editStaffInfoAccount } from "../Controller/adminUserControllers";
import { AdminTokenAuth } from "../Config/TokenAuth";
import { validate } from "../Zod/Validator";
import { adminLogoutZodSchema, changeStaffCredZodSchema, editHeadZodSchema, editStaffCredSendAuthCodeZodSchema, editStaffInfoZodSchema, editStaffZodSchema } from "../Zod/ZodSchemaAdminUser";
import upload from "../Config/upload";

const AdminUserRoutes = Router();

AdminUserRoutes.use(AdminTokenAuth);
AdminUserRoutes.post("/adminLogout", validate(adminLogoutZodSchema), adminLogout);
AdminUserRoutes.post("/editHead", upload.any(), validate(editHeadZodSchema), editHead)
AdminUserRoutes.post("/editStaff", upload.any(), validate(editStaffZodSchema), editStaff)
AdminUserRoutes.post("/editStaffAccount", upload.any(), validate(editStaffInfoZodSchema), editStaffInfoAccount)
AdminUserRoutes.post("/editStaffCredSendAuthCode", validate(editStaffCredSendAuthCodeZodSchema), editStaffCredSendAuthCode)
AdminUserRoutes.post("/changeStaffCred", validate(changeStaffCredZodSchema), changeStaffCred)

export default AdminUserRoutes;