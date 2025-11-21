import { Router } from 'express';
import { adminLogout, changeStaffCred, editHead, editStaff, editStaffCredSendAuthCode, editStaffInfoAccount, updateTour } from '../Controller/adminUserControllers';
import { AdminTokenAuth } from '../Helper/TokenAuth';
import { validate } from '../Validator/Validator';
import {
  adminLogoutZodSchema,
  changeStaffCredZodSchema,
  editHeadZodSchema,
  editStaffCredSendAuthCodeZodSchema,
  editStaffInfoZodSchema,
  editStaffZodSchema,
  updateTourZodSchema,
} from '../Validator/ZodSchemaAdminUser';
import upload from '../Helper/upload';

const AdminUserRoutes = Router();

AdminUserRoutes.use(AdminTokenAuth);
AdminUserRoutes.post('/adminLogout', validate(adminLogoutZodSchema), adminLogout);
AdminUserRoutes.post('/editHead', upload.any(), validate(editHeadZodSchema), editHead);
AdminUserRoutes.post('/editStaff', upload.any(), validate(editStaffZodSchema), editStaff);
AdminUserRoutes.post('/editStaffAccount', upload.any(), validate(editStaffInfoZodSchema), editStaffInfoAccount);
AdminUserRoutes.post('/editStaffCredSendAuthCode', validate(editStaffCredSendAuthCodeZodSchema), editStaffCredSendAuthCode);
AdminUserRoutes.post('/changeStaffCred', validate(changeStaffCredZodSchema), changeStaffCred);
AdminUserRoutes.post('/updateTour', validate(updateTourZodSchema), updateTour);

export default AdminUserRoutes;
