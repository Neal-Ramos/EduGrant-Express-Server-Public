import { Router } from 'express';
import {
  registerAccount,
  loginAccounts,
  sendAuthCodeRegister,
  sendAuthCodeLogin,
  forgotPassword,
  forgotPasswordSendAuthCode,
} from '../Controller/authControllers';
import { validate } from '../Validator/Validator';
import {
  forgotPasswordSendAuthCodeZodSchema,
  forgotPasswordZodSchema,
  loginAccountsZodSchema,
  registerAccountZodSchema,
  sendAuthCodeLoginZodSchema,
  sendAuthCodeRegisterZodSchema,
} from '../Validator/ZodSchemaUserAuth';
const UserAuthRoutes = Router();

UserAuthRoutes.post('/registerAccount', validate(registerAccountZodSchema), registerAccount);
UserAuthRoutes.post(
  '/sendAuthCodeRegister',
  validate(sendAuthCodeRegisterZodSchema),
  sendAuthCodeRegister,
);
UserAuthRoutes.post('/loginAccounts', validate(loginAccountsZodSchema), loginAccounts);
UserAuthRoutes.post('/sendAuthCodeLogin', validate(sendAuthCodeLoginZodSchema), sendAuthCodeLogin);
UserAuthRoutes.post('/forgotPassword', validate(forgotPasswordZodSchema), forgotPassword);
UserAuthRoutes.post(
  '/forgotPasswordSendAuthCode',
  validate(forgotPasswordSendAuthCodeZodSchema),
  forgotPasswordSendAuthCode,
);
export default UserAuthRoutes;
