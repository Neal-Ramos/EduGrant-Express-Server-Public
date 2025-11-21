import { Router } from 'express';
import {
  changePassword,
  downloadApplicationFile,
  getDashboard,
  getFileUrl,
  logoutUser,
  markAllReadNotifications,
  readNotification,
  sendAuthCodeChangeAccountCred,
  updateApplication,
  updateStudentInfo,
} from '../Controller/userController';
import { TokenAuth } from '../Helper/TokenAuth';
import { validate } from '../Validator/Validator';
import {
  changePasswordZodSchema,
  downloadApplicationFileZodSchema,
  getFileUrlZodSchema,
  readNotificationZodSchema,
  sendAuthCodeChangeAccountCredZodSchema,
  updateApplicationZodSchema,
  updateStudentInfoZodSchema,
} from '../Validator/ZodSchemaUserUser';
import upload from '../Helper/upload';

const UserUserRoutes = Router();

UserUserRoutes.use(TokenAuth);
UserUserRoutes.post('/logout', logoutUser);
UserUserRoutes.post('/markAllReadNotifications', markAllReadNotifications);
UserUserRoutes.post(
  '/updateStudentInfo',
  upload.any(),
  validate(updateStudentInfoZodSchema),
  updateStudentInfo,
);
UserUserRoutes.post(
  '/updateApplication',
  upload.any(),
  validate(updateApplicationZodSchema),
  updateApplication,
);
UserUserRoutes.post('/readNotification', validate(readNotificationZodSchema), readNotification);
UserUserRoutes.post(
  '/sendAuthCodeChangeAccountCred',
  validate(sendAuthCodeChangeAccountCredZodSchema),
  sendAuthCodeChangeAccountCred,
);
UserUserRoutes.post('/changePassword', validate(changePasswordZodSchema), changePassword);
UserUserRoutes.post('/getFileUrl', validate(getFileUrlZodSchema), getFileUrl);
UserUserRoutes.post(
  '/downloadApplicationFile',
  validate(downloadApplicationFileZodSchema),
  downloadApplicationFile,
);

UserUserRoutes.get('/getDashboard', getDashboard);

export default UserUserRoutes;
