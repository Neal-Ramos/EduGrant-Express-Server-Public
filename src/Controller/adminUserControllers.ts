import { NextFunction, Request, Response } from 'express';
import {
  adminLogoutZodType,
  changeStaffCredZodType,
  editHeadZodType,
  editStaffCredSendAuthCodeZodType,
  editStaffInfoZodType,
  editStaffZodType,
  updateTourZodType,
} from '../Validator/ZodSchemaAdminUser';
import { prismaGetAccountById, prismaUpdateAccountLoginCredentials, prismaUpdateHeadAccount, prismaUpdateStaffAccount, prismaUpdateWebTour } from '../Models/AccountModels';
import { compare, hash } from 'bcryptjs';
import { prismaUpdateStaffInfo } from '../Models/ISPSU_StaffModels';
import { GenerateCode } from '../Helper/CodeGenerator';
import { CreateEmailOptions } from 'resend';
import { authHTML } from '../utils/HTML-AuthCode';
import { SendAuthCode } from '../Config/Resend';
import { AuthCode } from '../Models/Auth_CodeModels';
import { ResponseUploadSupabase, UploadSupabase } from '../Config/Supabase';

export const adminLogout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { AdminToken } = (req as Request & { validated: adminLogoutZodType }).validated.cookies;
    
    res.clearCookie('AdminToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 60000 * 60 * 24 * 7,
      path: '/administrator',
      domain: '.edugrant.online',
    });
    res.status(200).json({ success: true, message: 'Log out successfully!' });
  } catch (error) {
    next(error);
  }
};
export const editHead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { address, fName, lName, mName, gender } = (req as Request & { validated: editHeadZodType }).validated.body;
    const file = (req.files as Express.Multer.File[]).find((f) => f.fieldname === 'profileImg');
    const HeadID = Number(req.tokenPayload.accountId);

    const checkAccount = await prismaGetAccountById(HeadID);
    if (!checkAccount) {
      res.status(401).json({ success: false, message: 'Account Did not Find!' });
      return;
    }
    if (checkAccount.role !== 'ISPSU_Head') {
      res.status(401).json({ success: false, message: 'This Account Cannot be Edit Here!' });
      return;
    }

    const pathForDelete: string[] = [];
    let newProfileImg: ResponseUploadSupabase | undefined = undefined;
    if (file) {
      const prevImgPath = (checkAccount.ISPSU_Head?.profileImg as { path: string })?.path;
      newProfileImg = await UploadSupabase(file, 'ISPSU_Head-Images');
      if (!newProfileImg.success) {
        res.status(500).json({ success: false, message: 'Upload Image Failed!' });
        return;
      }
      pathForDelete.push(prevImgPath);
    }

    const update = await prismaUpdateHeadAccount(HeadID, address, fName, lName, mName, gender, newProfileImg);
    if (!update) {
      res.status(500).json({ success: false, message: 'Server Error!' });
      return;
    }
    const { hashedPassword, ...updatedHead } = update;

    res.status(200).json({ success: true, message: 'Account Updated!', updatedHead });
  } catch (error) {
    next(error);
  }
};
export const editStaff = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { ownerId, fName, lName, mName, email, password, validate } = (req as Request & { validated: editStaffZodType }).validated.body;
    const profileImg: Express.Multer.File | undefined = (req.files as Express.Multer.File[]).find((f) => f.fieldname === 'profileImg');
    const HeadId = Number(req.tokenPayload.accountId);

    const checkHead = await prismaGetAccountById(HeadId);
    if (!checkHead) {
      res.status(401).json({ success: false, message: 'Account Did not Find!' });
      return;
    }
    if (checkHead.role !== 'ISPSU_Head') {
      res.status(401).json({ success: false, message: 'This Account Cannot be Edit Here!' });
      return;
    }

    const checkAccount = await prismaGetAccountById(ownerId);
    if (!checkAccount) {
      res.status(404).json({ success: false, message: 'Account did not Find!' });
      return;
    }
    if (checkAccount.role !== 'ISPSU_Staff') {
      res.status(400).json({ success: false, message: 'Account is Not Staff!' });
      return;
    }
    const newHashedPassword = password ? await hash(password, 10) : undefined;
    let profileURL = undefined;
    if (profileImg) {
      profileURL = await UploadSupabase(profileImg, 'ISPSU_Staff');
      if (!profileURL) {
        res.status(500).json({ success: false, message: 'Upload Fail!' });
        return;
      }
    }

    const updateStaff = await prismaUpdateStaffAccount(ownerId, fName, lName, mName, email, newHashedPassword, validate, profileURL);
    if (!updateStaff) {
      res.status(500).json({ success: false, message: 'Server Error' });
      return;
    }

    const { hashedPassword, ...safeData } = updateStaff;

    res.status(200).json({ success: true, message: 'Staff Account Updated!', updatedStaff: safeData });
  } catch (error) {
    next(error);
  }
};
export const editStaffInfoAccount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { fName, mName, lName } = (req as Request & { validated: editStaffInfoZodType }).validated.body;
    const file = (req.files as Express.Multer.File[]).find((f) => f.fieldname === 'profileImg');
    const accountId = Number(req.tokenPayload.accountId);

    const checkStaff = await prismaGetAccountById(accountId);
    if (!checkStaff) {
      res.status(401).json({ success: false, message: 'Account Did not Find!' });
      return;
    }
    if (checkStaff.role !== 'ISPSU_Staff') {
      res.status(401).json({ success: false, message: 'This Account Cannot be Edit Here!' });
      return;
    }

    const pathForDelete: string[] = [];
    let newProfileImg: ResponseUploadSupabase | undefined = undefined;
    if (file) {
      const prevImgPath = (checkStaff.ISPSU_Staff?.profileImg as { path: string })?.path;
      newProfileImg = await UploadSupabase(file, 'ISPSU_Head-Images');
      if (!newProfileImg.success) {
        res.status(500).json({ success: false, message: 'Upload Image Failed!' });
        return;
      }
      pathForDelete.push(prevImgPath);
    }

    const updatedStaffInfo = await prismaUpdateStaffInfo(accountId, fName, mName, lName, newProfileImg);
    if (!updatedStaffInfo) {
      res.status(500).json({ success: false, message: 'Server Error!' });
      return;
    }
    const { hashedPassword, ...safeDate } = updatedStaffInfo;
    res.status(200).json({ success: true, message: 'Staff Info Updated!', updatedStaffInfo: safeDate });
  } catch (error) {}
};
export const editStaffCredSendAuthCode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const accountId = Number(req.tokenPayload.accountId);
    const origin = 'ChangeLoginInfoStaff';
    const { oldPass, newPass } = (req as Request & { validated: editStaffCredSendAuthCodeZodType }).validated.body;

    const checkStaff = await prismaGetAccountById(accountId);
    if (!checkStaff) {
      res.status(401).json({ success: false, message: 'Account Did not Find!' });
      return;
    }
    if (checkStaff.role !== 'ISPSU_Staff') {
      res.status(401).json({ success: false, message: 'This Account Cannot be Edit Here!' });
      return;
    }

    if (newPass) {
      if (!oldPass) {
        res.status(401).json({ success: false, message: 'New Password And New one Required!' });
        return;
      }
      const validateOldPass = await compare(oldPass, checkStaff.hashedPassword);
      if (!validateOldPass) {
        res.status(401).json({ success: false, message: 'Old Password Not Match!' });
        return;
      }
    }

    const prevCode = await AuthCode.Find(checkStaff.email, origin);
    if (prevCode) {
      const { validated } = await AuthCode.validate(prevCode.code, prevCode.owner, prevCode.origin);
      if (validated) {
        const resendAvailableIn = (new Date(prevCode.dateCreated).getTime() - new Date().getTime()) / 1000;
        res.status(200).json({
          success: true,
          message: 'Email Already Sent!',
          expiresAt: prevCode.dateExpiry,
          ttl: 120,
          resendAvailableIn,
        });
        return;
      }
    }

    const code = await GenerateCode(6);
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000);
    const DOMAIN = process.env.DOMAIN;

    const mailOptions: CreateEmailOptions = {
      to: checkStaff.email,
      from: `edugrant@${DOMAIN}`,
      subject: 'Change Login Info',
      html: authHTML(code),
    };
    const send = await SendAuthCode(mailOptions, origin, checkStaff.email, code, expiresAt);
    if (!send.success) {
      res.status(400).json({ succes: false, message: send.message });
      return;
    }
    res.status(200).json({ success: true, message: 'Code Sent!' });
  } catch (error) {
    next(error);
  }
};
export const changeStaffCred = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const accountId = Number(req.tokenPayload.accountId);
    const { code, newEmail, oldPass, newPass } = (req as Request & { validated: changeStaffCredZodType }).validated.body;

    const checkStaff = await prismaGetAccountById(accountId);
    if (!checkStaff) {
      res.status(401).json({ success: false, message: 'Account Did not Find!' });
      return;
    }
    if (checkStaff.role !== 'ISPSU_Staff') {
      res.status(401).json({ success: false, message: 'This Account Cannot be Edit Here!' });
      return;
    }
    if (newPass) {
      if (!oldPass) {
        res.status(400).json({ success: false, message: 'New Password And New one Required!' });
        return;
      }
      const validateOldPass = await compare(oldPass, checkStaff.hashedPassword);
      if (!validateOldPass) {
        res.status(400).json({ success: false, message: 'Old Password Not Match!' });
        return;
      }
    }

    const Code = await AuthCode.validate(code, checkStaff.email, 'ChangeLoginInfoStaff');
    if (!Code.validated) {
      res.status(400).json({ success: false, message: Code.message });
      return;
    }

    const updateStaffLoginCred = await prismaUpdateAccountLoginCredentials(accountId, undefined, newEmail, newPass);

    if (!updateStaffLoginCred) {
      res.status(500).json({ success: false, message: 'Server Error!' });
      return;
    }
    res.status(200).json({ success: true, message: 'Account Login Info Updated' });
  } catch (error) {
    next(error);
  }
};
export const updateTour = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { dashboardTour } = (req as Request & { validated: updateTourZodType }).validated.body;
    const accountId = Number(req.tokenPayload.accountId);

    const checkStaff = await prismaGetAccountById(accountId);
    if (!checkStaff) {
      res.status(401).json({ success: false, message: 'Account Did not Find!' });
      return;
    }
    if (checkStaff.role !== 'ISPSU_Staff' && checkStaff.role !== 'ISPSU_Head') {
      res.status(401).json({ success: false, message: 'This Account Cannot be Edit Here!' });
      return;
    }

    const webTour = checkStaff.webTours as Record<string, boolean>;
    webTour.dashboardTour = dashboardTour === 'true' ? true : false;

    const updateWebTour = await prismaUpdateWebTour(accountId, webTour);
    if (!updateWebTour) {
      res.status(500).json({ success: false, message: 'Server Error!' });
      return;
    }

    res.status(500).json({ success: true, message: 'Tour Updated!' });
  } catch (error) {
    next(error);
  }
};
