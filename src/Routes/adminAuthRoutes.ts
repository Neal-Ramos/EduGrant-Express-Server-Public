import { Router } from 'express';
import { adminCodeAuthentication, adminLogIn, forgetPass, sendAuthCodeForgetPass } from '../Controller/adminAuthControllers';
import { validate } from '../Validator/Validator';
import {
  adminCodeAuthenticationZodSchema,
  adminLoginZodSchema,
  forgetPassZodSchema,
  sendAuthCodeForgetPassZodSchema,
} from '../Validator/ZodSchemanAdminAuth';

const AdminAuthRoutes = Router();

AdminAuthRoutes.post('/adminLogin', validate(adminLoginZodSchema), adminLogIn);
AdminAuthRoutes.post('/adminCodeAuthentication', validate(adminCodeAuthenticationZodSchema), adminCodeAuthentication);
AdminAuthRoutes.post('/sendAuthCodeForgetPass', validate(sendAuthCodeForgetPassZodSchema), sendAuthCodeForgetPass);
AdminAuthRoutes.post('/forgetPass', validate(forgetPassZodSchema), forgetPass);

export default AdminAuthRoutes;
