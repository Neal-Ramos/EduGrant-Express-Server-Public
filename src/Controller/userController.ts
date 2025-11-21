import { NextFunction, Request, Response } from 'express';
import {
  changePasswordZodType,
  downloadApplicationFileZodType,
  getFileUrlZodType,
  readNotificationZodType,
  sendAuthCodeChangeAccountCredZodType,
  updateApplicationZodType,
  updateStudentInfoZodType,
} from '../Validator/ZodSchemaUserUser';
import {
  DeleteSupabase,
  ResponseUploadSupabase,
  ResponseUploadSupabasePrivate,
  SupabaseCreateSignedUrl,
  SupabaseDeletePrivateFile,
  SupabaseDownloadFile,
  UploadSupabase,
  UploadSupabasePrivate,
} from '../Config/Supabase';
import { prismaGetAccountById, prismaUpdateAccountLoginCredentials, prismaUpdateStudentAccount } from '../Models/AccountModels';
import { compare, hash } from 'bcryptjs';
import { CreateEmailOptions } from 'resend';
import { SendAuthCode } from '../Config/Resend';
import { authHTML } from '../utils/HTML-AuthCode';
import { prismaGetApplication, prismaUpdateApplicationSubmittedFiles } from '../Models/ApplicationModels';
import { prismaGetScholarshipsById } from '../Models/ScholarshipModels';
import { applicationFilesTypes, RecordApplicationFilesTypes } from '../Types/postControllerTypes';
import { prismaGetDashboardData } from '../Models/StudentModels';
import { prismaReadAllNotifications, prismaReadTrueNotification } from '../Models/Student_NotificationModels';
import { GenerateCode } from '../Helper/CodeGenerator';
import { AuthCode } from '../Models/Auth_CodeModels';
import { cookieOptionsStudent } from '../Helper/TokenAuth';
import { error } from 'console';
import { io } from '..';
import { DenormalizeApplication } from '../Helper/ApplicationHelper';

export const logoutUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.clearCookie('token', cookieOptionsStudent);
    res.status(200).json({ success: true, message: 'Logged out successfully!' });
  } catch (error) {
    next(error);
  }
};
export const updateStudentInfo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const file = (req.files as Express.Multer.File[]).find((f) => f.fieldname === 'profileImg');
    const pathToDelete: string[] = [];
    const { contactNumber, firstName, middleName, lastName, gender, dateOfBirth, address, course, year, section, familyBackground, pwd, indigenous } = (
      req as Request & { validated: updateStudentInfoZodType }
    ).validated.body;
    const accountId = Number(req.tokenPayload.accountId);

    const checkAccount = await prismaGetAccountById(accountId);
    if (!checkAccount || checkAccount.role !== 'Student') {
      res.clearCookie('token', cookieOptionsStudent);
      res.status(401).json({ success: false, message: 'Account Did not Find!' });
      return;
    }

    let newPorfileImg: ResponseUploadSupabase | undefined = undefined;
    if (file) {
      newPorfileImg = (await UploadSupabase(file, 'Student-Images')) as ResponseUploadSupabase;
      const prevImg = (checkAccount.Student?.profileImg as { path: string })?.path;
      if (!newPorfileImg.success) {
        res.status(500).json({ success: false, message: 'Upload Failed!' });
        return;
      }
      if (prevImg) {
        pathToDelete.push(prevImg);
      }
    }

    const updateStudent = await prismaUpdateStudentAccount(
      accountId,
      contactNumber,
      firstName,
      middleName,
      lastName,
      gender,
      dateOfBirth,
      address,
      course,
      year,
      section,
      familyBackground,
      pwd,
      indigenous,
      newPorfileImg,
    );

    if (!updateStudent) {
      res.status(500).json({ success: true, message: 'Server Error!' });
      if (newPorfileImg)
        await DeleteSupabase([newPorfileImg.path]).catch((error) => {
          console.log(error);
        });
      return;
    }
    const { hashedPassword, ...updatedStudent } = updateStudent;

    res.status(200).json({ success: true, message: 'Account Information Updated!', updatedStudent });
    if (pathToDelete.length)
      await DeleteSupabase(pathToDelete).catch((error) => {
        console.log(error);
      });
  } catch (error) {
    next(error);
  }
};
export const updateApplication = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { scholarshipId, applicationId } = (req as Request & { validated: updateApplicationZodType }).validated.body;
    const newFiles = req.files as Express.Multer.File[];
    const accountId = Number(req.tokenPayload.accountId);

    const checkAccount = await prismaGetAccountById(accountId);
    if (!checkAccount || checkAccount.role !== 'Student') {
      res.clearCookie('token', cookieOptionsStudent);
      res.status(401).json({ success: false, message: 'Account Did not Find!' });
      return;
    }

    const checkScholarship = await prismaGetScholarshipsById(scholarshipId);
    const phase = `phase-${checkScholarship?.phase}`;
    if (!checkScholarship) {
      res.status(404).json({ success: false, message: 'Scholarship Not Found!' });
      return;
    }
    const application = await prismaGetApplication(applicationId);
    if (!application) {
      res.status(404).json({ success: false, message: 'Application Not Found!' });
      return;
    }
    if (application.status !== 'PENDING') {
      res.status(400).json({ success: false, message: 'Application is under review!' });
      return;
    }
    if (application.ownerId !== accountId) {
      res.status(400).json({ success: false, message: 'Application Is not Yours!' });
      return;
    }
    const submittedDocuments: RecordApplicationFilesTypes = application.submittedDocuments as RecordApplicationFilesTypes;
    const prevPaths: string[] = [];
    const newPaths: string[] = [];
    if (!submittedDocuments) {
      res.status(404).json({ success: false, message: 'Prev Files Did not Find!' });
      return;
    }

    for (const value of submittedDocuments[phase]) {
      const file = newFiles.find((f) => f.fieldname === value.document);
      if (file) {
        prevPaths.push(value.supabasePath);
        const newfile: ResponseUploadSupabasePrivate = await UploadSupabasePrivate(file, 'student-application-files');
        newPaths.push(newfile.path);
        value.fileFormat = file.mimetype;
        value.resourceType = file.mimetype;
        value.supabasePath = newfile.path;
      }
    }

    const allApplicationPaths: string[] = [...(application.supabasePath as string[]), ...newPaths].filter((f) => !prevPaths.includes(f));
    const updateSubmittedFiles = await prismaUpdateApplicationSubmittedFiles(applicationId, accountId, scholarshipId, submittedDocuments, allApplicationPaths);
    if (!updateSubmittedFiles) {
      res.status(500).json({ success: false, message: 'Server Error' });
      await SupabaseDeletePrivateFile(newPaths).catch((error) => console.log(error));
      return;
    }

    res.status(200).json({ success: true, updatedApplication: DenormalizeApplication(application) });
    io.emit('updateApplication', { updatedApplication: DenormalizeApplication(application) });
    await SupabaseDeletePrivateFile(prevPaths).catch((error) => console.log(error));
  } catch (error) {
    next(error);
  }
};
export const readNotification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { notifiactionId } = (req as Request & { validated: readNotificationZodType }).validated.body;
    const accountId = Number(req.tokenPayload.accountId);

    const checkAccount = await prismaGetAccountById(accountId);
    if (!checkAccount || checkAccount.role !== 'Student') {
      res.clearCookie('token', cookieOptionsStudent);
      res.status(401).json({ success: false, message: 'Account Did not Find!' });
      return;
    }

    const readNotification = await prismaReadTrueNotification(accountId, notifiactionId);
    if (!readNotification) {
      res.status(500).json({ success: false, message: 'Server Error!' });
      return;
    }
    res.status(200).json({ success: true, message: 'Notification Read!' });
  } catch (error) {
    next(error);
  }
};
export const markAllReadNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const accountId = Number(req.tokenPayload.accountId);

    const checkAccount = await prismaGetAccountById(accountId);
    if (!checkAccount || checkAccount.role !== 'Student') {
      res.clearCookie('token', cookieOptionsStudent);
      res.status(401).json({ success: false, message: 'Account Did not Find!' });
      return;
    }

    const readAllNotifications = await prismaReadAllNotifications(accountId);
    if (!readAllNotifications) {
      res.status(500).json({ success: false, message: 'Server Error!' });
      return;
    }
    res.status(200).json({ success: true, message: 'Notification Read!' });
  } catch (error) {
    next(error);
  }
};
export const sendAuthCodeChangeAccountCred = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { oldPassword, newPassword } = (req as Request & { validated: sendAuthCodeChangeAccountCredZodType }).validated.body;
    const origin = 'Change_Password';
    const accountId = Number(req.tokenPayload.accountId);

    const checkAccount = await prismaGetAccountById(accountId);
    if (!checkAccount || checkAccount.role !== 'Student') {
      res.clearCookie('token', cookieOptionsStudent);
      res.status(401).json({ success: false, message: 'Account Did not Find!' });
      return;
    }

    const Code = await AuthCode.Find(checkAccount.email, origin);
    if (Code) {
      const { validated } = await AuthCode.validate(Code.code, Code.owner, Code.origin);
      if (validated) {
        const resendAvailableIn = (new Date(Code.dateExpiry).getTime() - new Date().getTime()) / 1000;
        res.status(200).json({
          success: true,
          message: 'Email Already Sent!',
          expiresAt: Code.dateExpiry,
          ttl: 120,
          resendAvailableIn,
        });
        return;
      }
    }
    if (oldPassword && newPassword) {
      const verifyPass = await compare(oldPassword, checkAccount.hashedPassword);
      if (!verifyPass) {
        res.status(400).json({ success: false, message: 'Old Password not matched!' });
        return;
      }
    }

    await AuthCode.DeleteAll(checkAccount.email, origin);
    const code = await GenerateCode(6);
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000);
    const mailOptions: CreateEmailOptions = {
      to: checkAccount.email,
      from: 'service@edugrant.online',
      subject: 'Change Account Password',
      html: authHTML(code),
    };
    const send = await SendAuthCode(mailOptions, origin, checkAccount.email, code, expiresAt);
    if (!send.success) {
      res.status(400).json({ success: false, message: send.message });
      return;
    }
    res.status(200).json({ success: false, message: 'Email Sent!', expiresAt, ttl: 120, resendAvailableIn: 60 });
  } catch (error) {
    next(error);
  }
};
export const changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { oldPassword, newPassword, code, email } = (req as Request & { validated: changePasswordZodType }).validated.body;
    const accountId = Number(req.tokenPayload.accountId);

    const checkAccount = await prismaGetAccountById(accountId);
    if (!checkAccount || checkAccount.role !== 'Student') {
      res.clearCookie('token', cookieOptionsStudent);
      res.status(401).json({ success: false, message: 'Account Did not Find!' });
      return;
    }

    if (oldPassword && newPassword) {
      const verifyPass = await compare(oldPassword, checkAccount.hashedPassword);
      if (!verifyPass) {
        res.status(400).json({ success: false, message: 'Old Password not matched!' });
        return;
      }
    }

    const Code = await AuthCode.validate(code, email, 'Change_Password');
    if (Code.validated === false || !Code.AuthCode) {
      res.status(400).json({ success: false, message: Code.message });
      return;
    }

    const update = await prismaUpdateAccountLoginCredentials(accountId, undefined, undefined, newPassword);
    if (!update) {
      res.status(500).json({ success: false, message: 'Server Error!' });
      return;
    }
    res.status(200).json({ success: false, message: 'Password Changed!' });
    await AuthCode.DeleteAll(checkAccount.email, Code.AuthCode.origin);
  } catch (error) {
    next(error);
  }
};
export const getDashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const accountId = Number(req.tokenPayload.accountId);

    const checkAccount = await prismaGetAccountById(accountId);
    if (!checkAccount || checkAccount.role !== 'Student') {
      res.clearCookie('token', cookieOptionsStudent);
      res.status(401).json({ success: false, message: 'Account Did not Find!' });
      return;
    }
    const getDashboardData = await prismaGetDashboardData(accountId);
    res.status(200).json(getDashboardData);
  } catch (error) {
    next(error);
  }
};
export const getFileUrl = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { applicationId, path } = (req as Request & { validated: getFileUrlZodType }).validated.body;
    const accountId = Number(req.tokenPayload.accountId);

    const checkAccount = await prismaGetAccountById(accountId);
    if (!checkAccount || checkAccount.role !== 'Student') {
      res.clearCookie('token', cookieOptionsStudent);
      res.status(401).json({ success: false, message: 'Account Did not Find!' });
      return;
    }

    const checkApplication = await prismaGetApplication(applicationId);
    if (checkApplication?.ownerId !== accountId) {
      res.status(400).json({ success: false, message: 'This Application is not yours!' });
      return;
    }
    if (!(checkApplication.supabasePath as string[]).find((f) => f === path)) {
      res.status(400).json({ success: false, message: 'This Path is not from this Application!' });
      return;
    }

    const signedURLs = await SupabaseCreateSignedUrl(path);
    if (!signedURLs.success) {
      res.status(500).json({ success: false, message: signedURLs.message });
      return;
    }
    res.status(200).json({ success: true, message: 'URL Genarated!', signedURL: signedURLs.signedURLs });
  } catch (error) {
    next(error);
  }
};
export const downloadApplicationFile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { path, applicationId } = (req as Request & { validated: downloadApplicationFileZodType }).validated.body;
    const accountId = Number(req.tokenPayload.accountId);

    const checkAccount = await prismaGetAccountById(accountId);
    if (!checkAccount || checkAccount.role !== 'Student') {
      res.clearCookie('token', cookieOptionsStudent);
      res.status(401).json({ success: false, message: 'Account Did not Find!' });
      return;
    }

    const checkApplication = await prismaGetApplication(applicationId);
    if (!checkApplication) {
      res.status(400).json({ success: false, message: 'Application Did not Find!' });
      return;
    }
    if (!(checkApplication.supabasePath as string[]).find((f) => f === path)) {
      res.status(400).json({ success: false, message: 'This Path is not from this Application!' });
      return;
    }

    const { downloadURL, success, message } = await SupabaseDownloadFile(path);
    if (!success || !downloadURL) {
      res.status(500).json({ success: false, message });
      return;
    }

    const fetchSupabase = await fetch(downloadURL);
    const contentType = fetchSupabase.headers.get('content-type') || 'application/octet-stream';
    const arrayBuffer = await fetchSupabase.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const fileName = path.split('/').pop() || 'downloaded-file';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};
