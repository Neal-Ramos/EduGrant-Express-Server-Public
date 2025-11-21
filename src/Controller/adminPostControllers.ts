import { NextFunction, Request, Response } from 'express';
import { Prisma } from '../lib/prisma';
import { DeleteSupabase, ResponseUploadSupabase, SupabaseCreateSignedUrl, SupabaseDeletePrivateFile, SupabaseDownloadFile, UploadSupabase } from '../Config/Supabase';
import {
  adminAddScholarshipsZodType,
  approveApplicationZodType,
  createAnnouncementZodType,
  declineApplicationZodType,
  deleteAdminZodType,
  deleteAnnouncementZodType,
  deleteISPSU_StaffZodType,
  deleteScholarshipZodType,
  deleteStudentZodType,
  downloadApplicationCSVZodType,
  downloadStudentsCSVZodType,
  editAnnouncementZodType,
  endScholarshipZodType,
  forInterviewZondType,
  getAllAdminZodType,
  getAnnouncementByIdZodType,
  getAnnouncementZodType,
  getApplicationByIdZodType,
  getApplicationZodType,
  getFilterDataZodType,
  getFiltersCSVZodType,
  getScholarshipsByIdZodType,
  getScholarshipZodType,
  getStaffByIdZodType,
  getStaffLogsZodType,
  getStudentsByIdZodType,
  getStudentsZodType,
  renewalScholarshipZodType,
  searchAdminZodType,
  searchApplicationZodType,
  searchStudentZodType,
  updateScholarshipZodType,
  updateStudentAccountZodType,
  validateStaffZodType,
} from '../Validator/ZodSchemaAdminPost';
import { CreateEmailOptions } from 'resend';
import { ApproveHTML } from '../utils/HTML-ApprovedApplication';
import { interviewHTML } from '../utils/HTML-InterviewApplication';
import { prismaGetStaffAccounts, prismaGetStaffById, prismaSearchISPUStaff, prismaTotalCountStaff, prismaValidateStaff } from '../Models/ISPSU_StaffModels';
import { prismaCheckEmailExist, prismaCreateISPSU_Staff, prismaDeleteAccount, prismaGetAccountById, prismaGetHeadDashboard, prismaHEADUpdateStudentAccount } from '../Models/AccountModels';
import {
  prismaCreateScholarship,
  prismaDeleteScholarship,
  prismaEndScholarship,
  prismaFiltersScholarship,
  prismaGetScholarship,
  prismaGetScholarshipByArray,
  prismaGetScholarshipsById,
  prismaRenewScholarship,
  prismaStudentCountsInToken,
  prismaUpdateScholarship,
} from '../Models/ScholarshipModels';
import {
  prismaAcceptForInterview,
  prismaApproveApplication,
  prismaBlockApplicationByApplicationId,
  prismaCheckApproveGov,
  prismaDeclineApplication,
  prismaGetAllApplication,
  prismaGetApplication,
  prismaGetApplicationsCSV,
  prismaGetFiltersForApplicationsCSV,
  prismaSearchApplication,
} from '../Models/ApplicationModels';
import { prismaExportCSV, prismaFiltersStudent, prismaGetFiltersStudentCSV, prismaGetStudentById, prismaGetStudents, prismaSearchStudents } from '../Models/StudentModels';
import { prismaGetApplicationByIdScholarshipId } from '../Models/Application_DecisionModels';
import { prismaCreateAnnouncement, prismaDeleteAnnouncement, prismaEditAnnouncement, prismaGetAllAnnouncement, prismaGetAnnouncementById } from '../Models/AnnouncementModels';
import { declineHTML } from '../utils/HTML-DeclinedApplication';
import { chunkArray } from '../Helper/Helpers';
import { io } from '..';
import { prismaGetStaffLogs } from '../Models/Staff_LogsModels';
import { hash } from 'bcryptjs';
import { ExportToExcel } from '../Helper/ExcelJS';
import { TokenPayload } from '../Types/authControllerTypes';
import { cookieOptionsStaff } from '../Helper/TokenAuth';
import { downloadApplicationFileZodType, getFileUrlZodType } from '../Validator/ZodSchemaUserUser';
import { createAccountZodType } from '../Validator/ZodSchemanAdminAuth';
import { DenormalizeApplication } from '../Helper/ApplicationHelper';
import { sendApplicationUpdate } from '../Config/Resend';

export const getAllAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = Number(req.tokenPayload.accountId);

    const HeadId = await prismaGetAccountById(userId);
    if (!HeadId || HeadId.role !== 'ISPSU_Head') {
      res.clearCookie('AdminToken', cookieOptionsStaff);
      res.status(401).json({ success: false, message: 'Account Did not Find!' });
      return;
    }

    const { page, dataPerPage, sortBy, accountId, order } = (req as Request & { validated: getAllAdminZodType }).validated.query;

    if (!page || !dataPerPage) {
      res.status(400).json({ success: false, message: 'Incomplete Credentials!' });
      return;
    }
    const totalAccounts = await prismaTotalCountStaff(accountId);
    const getAdmin = await prismaGetStaffAccounts(page, dataPerPage, sortBy, accountId, order);
    const meta = {
      page: page,
      pageSize: dataPerPage,
      totalRows: totalAccounts,
      totalPage: Math.ceil(totalAccounts / dataPerPage),
      sortBy: sortBy ? sortBy : 'default',
      order: order ? order : 'default',
      filters: JSON.stringify({}),
    };
    res.status(200).json({ data: getAdmin, meta });
  } catch (error) {
    next(error);
  }
};
export const searchAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = Number(req.tokenPayload.accountId);
    const { page, dataPerPage, accountId, search, sortBy, order } = (req as Request & { validated: searchAdminZodType }).validated.query;

    const HeadId = await prismaGetAccountById(userId);
    if (!HeadId || HeadId.role !== 'ISPSU_Head') {
      res.clearCookie('AdminToken', cookieOptionsStaff);
      res.status(401).json({ success: false, message: 'Account Did not Find!' });
      return;
    }

    if (!page || !dataPerPage) {
      res.status(400).json({ success: false, message: 'Incomplete Credentials!' });
      return;
    }

    const getSearchAdmin = await prismaSearchISPUStaff(search, page, dataPerPage, sortBy, order, accountId);

    const meta = {
      page: page,
      pageSize: dataPerPage,
      totalRows: getSearchAdmin.totalCount,
      totalPage: Math.ceil(getSearchAdmin.totalCount / dataPerPage),
      sortBy: sortBy ? sortBy : 'default',
      order: order ? order : 'default',
      filters: JSON.stringify({}),
    };

    res.status(200).json({ data: getSearchAdmin.staffAccounts, meta });
  } catch (error) {
    next(error);
  }
};
export const getStaffById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = Number(req.tokenPayload.accountId);

    const HeadId = await prismaGetAccountById(userId);
    if (!HeadId || HeadId.role !== 'ISPSU_Head') {
      res.clearCookie('AdminToken', cookieOptionsStaff);
      res.status(401).json({ success: false, message: 'Account Did not Find!' });
      return;
    }

    const { staffId } = (req as Request & { validated: getStaffByIdZodType }).validated.query;

    const staff = await prismaGetStaffById(staffId);
    if (!staff) {
      res.status(404).json({ success: false, message: 'Staff did not Found!' });
      return;
    }
    const { hashedPassword, ...safeData } = staff;
    res.status(200).json({ success: true, safeData });
  } catch (error) {
    next(error);
  }
};
export const createISPSUStaffAccount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let { email, firstName, middleName, lastName, phone, password } = (req as Request & { validated: createAccountZodType }).validated.body;

    const emailDuplicate = await prismaCheckEmailExist(email);
    if (emailDuplicate) {
      res.status(401).json({ success: false, message: 'Email Already Exist' });
      return;
    }

    password = await hash(password, 10);
    const insertAdminToDB = await prismaCreateISPSU_Staff(email, firstName, middleName, lastName, phone, password);
    if (!insertAdminToDB) {
      res.status(500).json({ success: false, message: 'Database Error!' });
      return;
    }
    const { hashedPassword, ...newAccount } = insertAdminToDB;
    res.status(200).json({ success: true, message: 'ISPSU Staff Account Created!', newAccount });
    return;
  } catch (error) {
    next(error);
  }
};
export const deleteAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = Number(req.tokenPayload.accountId);

    const HeadId = await prismaGetAccountById(id);
    if (!HeadId || HeadId.role !== 'ISPSU_Head') {
      res.clearCookie('AdminToken', cookieOptionsStaff);
      res.status(401).json({ success: false, message: 'Account Did not Find!' });
      return;
    }
    const { accountId } = (req as Request & { validated: deleteAdminZodType }).validated.body;

    const deleteAdmin = await prismaDeleteAccount(accountId);
    io.emit('deleteAdmin', { accountId });

    res.status(200).json({
      success: true,
      message: 'Admin Accounts Deleted!',
      affectedRows: deleteAdmin,
      staffId: accountId,
    });
  } catch (error) {
    next(error);
  }
};
export const validateStaff = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { staffId } = (req as Request & { validated: validateStaffZodType }).validated.body;
    const headId = Number(req.tokenPayload.accountId);

    const HeadId = await prismaGetAccountById(headId);
    if (!HeadId || HeadId.role !== 'ISPSU_Head') {
      res.clearCookie('AdminToken', cookieOptionsStaff);
      res.status(401).json({ success: false, message: 'Account Did not Find!' });
      return;
    }
    const checkStaffAccount = await prismaGetStaffById(staffId);
    if (!checkStaffAccount) {
      res.status(404).json({ success: false, message: 'Staff Account Did not Find!' });
      return;
    }

    const validateStaff = await prismaValidateStaff(staffId, !checkStaffAccount.ISPSU_Staff?.validated);
    if (!validateStaff) {
      res.status(500).json({ success: false, message: 'Server Error!' });
      return;
    }
    res.status(200).json({ success: true, message: 'Account Updated' });
  } catch (error) {
    next(error);
  }
};
export const deleteISPSU_Staff = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { staffId } = (req as Request & { validated: deleteISPSU_StaffZodType }).validated.body;
    const headId = Number(req.tokenPayload.accountId);

    const HeadId = await prismaGetAccountById(headId);
    if (!HeadId || HeadId.role !== 'ISPSU_Head') {
      res.clearCookie('AdminToken', cookieOptionsStaff);
      res.status(401).json({ success: false, message: 'Account Did not Find!' });
      return;
    }

    const checkStaff = await prismaGetAccountById(staffId);
    if (!checkStaff) {
      res.status(404).json({ success: false, message: 'Staff Did not Find!' });
      return;
    }
    if (checkStaff.role !== 'ISPSU_Staff') {
      res.status(400).json({ success: false, message: 'This Account Is not a Staff!' });
      return;
    }

    const deleteStaff = await prismaDeleteAccount([staffId]);
    if (!deleteStaff) {
      res.status(500).json({ success: false, message: 'Server Error!' });
      return;
    }
    res.status(200).json({ success: false, message: 'Staff Deleted!' });
    if ((checkStaff.ISPSU_Staff?.profileImg as { path: string })?.path) {
      await DeleteSupabase([(checkStaff.ISPSU_Staff?.profileImg as { path: string })?.path]).catch((error) => console.log(error));
    }
  } catch (error) {
    next(error);
  }
};
export const adminTokenAuthentication = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const accountId = Number(req.tokenPayload.accountId);

    const ISPSU = await prismaGetAccountById(accountId);
    if (!ISPSU || (ISPSU.role !== 'ISPSU_Head' && ISPSU.role !== 'ISPSU_Staff')) {
      res.clearCookie('AdminToken', cookieOptionsStaff);
      res.status(401).json({ success: false, message: 'Account Did not Find!' });
      return;
    }
    if (ISPSU.role === 'ISPSU_Staff' && !ISPSU.ISPSU_Staff?.validated) {
      res.clearCookie('AdminToken', cookieOptionsStaff);
      res.status(401).json({ success: false, message: 'Account is not validated!' });
      return;
    }
    const { availableScholarshipCount, applicationCount, announcementCount, ISPSU_StaffCount, applicationCountPerStatus } = await prismaStudentCountsInToken();
    const { hashedPassword, ...safeData } = ISPSU;
    res.status(200).json({
      success: true,
      message: 'Access Granted!',
      safeData: safeData,
      availableScholarshipCount,
      applicationCount,
      announcementCount,
      ISPSU_StaffCount,
      applicationCountPerStatus,
    });
  } catch (error) {
    next(error);
  }
};
export const getDashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const accountId = Number(req.tokenPayload.accountId);

    const ISPSU = await prismaGetAccountById(accountId);
    if (!ISPSU || (ISPSU.role !== 'ISPSU_Staff' && ISPSU.role !== 'ISPSU_Head')) {
      res.clearCookie('AdminToken', cookieOptionsStaff);
      res.status(401).json({ success: false, message: 'Account Did not Find!' });
      return;
    }

    const getDashboardData = await prismaGetHeadDashboard();
    res.status(200).json(getDashboardData);
  } catch (error) {
    next(error);
  }
};
export const headDashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { accountId } = (req as Request & { tokenPayload: TokenPayload }).tokenPayload;

    const checkAccount = await prismaGetAccountById(accountId);
    if (!checkAccount) {
      res.status(401).json({ success: false, message: 'Account Did not Find!' });
      return;
    }
    if (checkAccount.role !== 'ISPSU_Head') {
      res.status(401).json({ success: false, message: 'Account is Not Valid!' });
      return;
    }

    const getData = await prismaGetHeadDashboard();
    res.status(200).json(getData);
  } catch (error) {
    next(error);
  }
};

export const adminAddScholarships = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { scholarshipType, newScholarTitle, newScholarProvider, newScholarDeadline, newScholarDescription, scholarshipDocuments, scholarshipAmount, scholarshipLimit, gwa, isForInterview } = (
      req as Request & { validated: adminAddScholarshipsZodType }
    ).validated.body;

    const adminId = Number(req.tokenPayload.accountId);

    const ISPSU_Head = await prismaGetAccountById(adminId);
    if (!ISPSU_Head || ISPSU_Head.role !== 'ISPSU_Head') {
      res.clearCookie('AdminToken', cookieOptionsStaff);
      res.status(401).json({ success: false, message: 'Account Did not Find!' });
      return;
    }
    if (!scholarshipDocuments.documents) {
      res.status(422).json({ success: false, message: 'Missing Field scholarshipDocuments.documents' });
      return;
    }
    const docs: { label: string }[] = scholarshipDocuments.documents;
    if (new Set(docs.map((d) => d.label)).size !== docs.length) {
      res.status(422).json({ success: false, message: 'Dupplicate Requirement Label!' });
      return;
    }

    const sponsorLogo = (req.files as Express.Multer.File[]).find((file) => file.fieldname === 'sponsorLogo');
    const coverImg = (req.files as Express.Multer.File[]).find((file) => file.fieldname === 'coverImg');
    const form = (req.files as Express.Multer.File[]).find((file) => file.fieldname === 'scholarshipForm');
    if (!sponsorLogo || !coverImg) {
      res.status(422).json({ success: false, message: 'Incomplete Image!' });
      return;
    }

    const sponsorResult: ResponseUploadSupabase = await UploadSupabase(sponsorLogo, 'scholarship-files');
    const coverResult: ResponseUploadSupabase = await UploadSupabase(coverImg, 'scholarship-files');
    const formResult: ResponseUploadSupabase | undefined = form ? await UploadSupabase(form, 'scholarship-files') : undefined;

    const insertScholarshipsData = await prismaCreateScholarship(
      scholarshipType,
      newScholarTitle,
      newScholarProvider,
      newScholarDeadline,
      newScholarDescription,
      scholarshipDocuments.documents,
      scholarshipAmount,
      scholarshipLimit,
      gwa,
      adminId,
      sponsorResult,
      coverResult,
      formResult,
      isForInterview,
    );
    if (!insertScholarshipsData) {
      res.status(500).json({ success: false, message: 'Database Error' });
      await DeleteSupabase([sponsorResult.path, coverResult.path, formResult?.path || '']);
      return;
    }
    res.status(200).json({ success: true, message: 'Scholarship Added!' });
    io.emit('adminAddScholarships', { newScholarship: insertScholarshipsData });
  } catch (error) {
    next(error);
  }
};

export const getScholarship = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { filters, page, dataPerPage, sortBy, order, status, search } = (req as Request & { validated: getScholarshipZodType }).validated.query;
    const userId = Number(req.tokenPayload.accountId);

    const user = await prismaGetAccountById(userId);
    if (!user || (user.role !== 'ISPSU_Staff' && user.role !== 'ISPSU_Head')) {
      res.clearCookie('AdminToken', cookieOptionsStaff);
      res.status(401).json({ success: false, message: 'Account Did not Find!' });
      return;
    }

    const getScholarshipsData = await prismaGetScholarship(page, dataPerPage, sortBy, order, status, filters, undefined, search);

    const meta = {
      count: {
        countActive: getScholarshipsData.countActive,
        countRenew: getScholarshipsData.countRenew,
        countExpired: getScholarshipsData.countExpired,
      },
      page: page ? page : 'none',
      pageSize: dataPerPage ? dataPerPage : 'none',
      totalRows: getScholarshipsData.totalCount,
      totalPage: Math.ceil(getScholarshipsData.totalCount / (dataPerPage || getScholarshipsData.totalCount)),
      sortBy: sortBy ? sortBy : 'default',
      order: order ? order : 'default',
      filters: (filters as { id: string; value: string[] }[])?.map((f) => f.id),
    };
    res.status(200).json({ data: getScholarshipsData.scholarship, meta });
  } catch (error) {
    next(error);
  }
};

export const getScholarshipsById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { scholarshipId } = (req as Request & { validated: getScholarshipsByIdZodType }).validated.query;
    const userId = Number(req.tokenPayload.accountId);

    const user = await prismaGetAccountById(userId);
    if (!user || (user.role !== 'ISPSU_Staff' && user.role !== 'ISPSU_Head')) {
      res.clearCookie('AdminToken', cookieOptionsStaff);
      res.status(401).json({ success: false, message: 'Account Did not Find!' });
      return;
    }

    const getScholarshipsByIdData = await prismaGetScholarshipsById(scholarshipId);
    if (!getScholarshipsByIdData) {
      res.status(404).json({ success: false, message: 'Scholarship Did not Found!!!' });
      return;
    }
    res.status(200).json({ success: true, message: 'Get Success!', scholarship: getScholarshipsByIdData });
  } catch (error) {
    next(error);
  }
};

export const updateScholarship = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let { scholarshipId, newScholarProvider, newScholarTitle, newScholarDeadline, newScholarDescription, scholarshipAmount, scholarshipLimit, gwa, scholarshipDocuments } = (
      req as Request & { validated: updateScholarshipZodType }
    ).validated.body;

    const accountId = Number(req.tokenPayload.accountId);

    const user = await prismaGetAccountById(accountId);
    if (!user || user.role !== 'ISPSU_Head') {
      res.clearCookie('AdminToken', cookieOptionsStaff);
      res.status(401).json({ success: false, message: 'Account Did not Find!' });
      return;
    }
    const scholarship = await prismaGetScholarshipsById(scholarshipId);
    if (!scholarship) {
      res.status(404).json({ success: false, message: 'Scholarship Did no Found!' });
      return;
    }
    if (scholarship.ended === true) {
      res.status(400).json({ success: false, message: 'Ended Scholarship Cannot be Edited!' });
      return;
    }
    const newSupabasePath = {
      ...(scholarship as { supabasePath: { [k: string]: string } }).supabasePath,
    };
    const deleteOldFiles: string[] = [];

    let scholarshipLogo: any = (req.files as Express.Multer.File[]).find((file) => file.fieldname === 'sponsorLogo');
    let scholarshipCover: any = (req.files as Express.Multer.File[]).find((file) => file.fieldname === 'coverImg');
    let scholarshipForm: any = (req.files as Express.Multer.File[]).find((file) => file.fieldname === 'scholarshipForm');

    if (scholarshipLogo) {
      scholarshipLogo = await UploadSupabase(scholarshipLogo, 'scholarship-files');
      deleteOldFiles.push(newSupabasePath.logo);
      newSupabasePath.logo = scholarshipLogo.path;
    }
    if (scholarshipCover) {
      scholarshipCover = await UploadSupabase(scholarshipCover, 'scholarship-files');
      deleteOldFiles.push(newSupabasePath.cover);
      newSupabasePath.cover = scholarshipCover.path;
    }
    if (scholarshipForm) {
      scholarshipForm = await UploadSupabase(scholarshipForm, 'scholarship-files');
      deleteOldFiles.push(newSupabasePath.form);
      scholarshipForm.form = scholarshipForm.path;
    }

    type ScholarshipDocs = Record<
      string,
      {
        label: string;
        requirementType: string;
        formats?: string[];
      }
    >;
    const phase: string = `phase-${scholarship.phase}`;
    const newDoc = scholarship.documents as ScholarshipDocs;

    if (scholarshipDocuments.documents[phase]) {
      newDoc[phase] = scholarshipDocuments.documents[phase];
    }

    const update = await prismaUpdateScholarship(
      scholarshipId,
      newScholarProvider,
      newScholarTitle,
      newScholarDeadline,
      scholarshipAmount,
      newScholarDescription,
      newDoc,
      scholarshipLimit,
      gwa,
      scholarshipLogo,
      scholarshipCover,
      scholarshipForm,
      newSupabasePath,
    );
    if (!update) {
      res.status(500).json({ success: false, message: 'Scholarship Not Updated!' });
      const deletePaths: string[] = [];
      if (scholarshipLogo) {
        deletePaths.push(scholarshipLogo.path);
      }
      if (scholarshipCover) {
        deletePaths.push(scholarshipCover.path);
      }
      if (scholarshipForm) {
        deletePaths.push(scholarshipForm.path);
      }
      deletePaths.length && (await DeleteSupabase(deletePaths).catch((error) => console.log(`Delete Files Error: ${error}`)));
      return;
    }
    await DeleteSupabase(deleteOldFiles).catch((error) => console.log(`Delete Files Error: ${error}`));
    res.status(200).json({ success: true, message: 'Scholarship Updated!', updatedScholarship: update });
    io.emit('updateScholarship', { update });
  } catch (error) {
    next(error);
  }
};

export const renewalScholarship = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { scholarshipId, renewDeadline, renewDocuments, isForInterview } = (req as Request & { validated: renewalScholarshipZodType }).validated.body;

    const accountId = Number(req.tokenPayload.accountId);

    const user = await prismaGetAccountById(accountId);
    if (!user || user.role !== 'ISPSU_Head') {
      res.clearCookie('AdminToken', cookieOptionsStaff);
      res.status(401).json({ success: false, message: 'Account Did not Find!' });
      return;
    }
    const scholarship = await prismaGetScholarshipsById(scholarshipId);
    if (!scholarship) {
      res.status(404).json({ success: false, message: 'Scholarship Did Not Find!' });
      return;
    }
    const deadline = new Date(scholarship.deadline);
    if (isNaN(deadline.getTime())) {
      res.status(400).json({ success: false, message: 'Invalid scholarship deadline!' });
      return;
    }
    if (deadline > new Date()) {
      res.status(400).json({ success: false, message: 'Scholarship Is Currently Active!' });
      return;
    }
    if (scholarship.ended === true) {
      res.status(400).json({ success: false, message: 'Ended Scholarship Cannot be Renewed' });
      return;
    }

    const updatedRequirements = scholarship.documents as Record<string, { [k: string]: string }>;
    updatedRequirements[`phase-${scholarship.phase + 1}`] = renewDocuments;

    const renewScholar = await prismaRenewScholarship(accountId, scholarshipId, updatedRequirements, renewDeadline, isForInterview);
    if (!renewScholar) {
      res.status(500).json({ success: false, message: 'Server Error!' });
      return;
    }
    const emitTo: string[] = renewScholar.Application.map((f) => f.ownerId.toString());
    res.status(200).json({ success: false, message: 'Scholarship Renewed!', renewedScholarship: renewScholar });
    io.to(['ISPSU_Head', 'ISPSU_Staff', ...emitTo]).emit('renewScholarship', { renewScholar });
  } catch (error) {
    next(error);
  }
};

export const endScholarship = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { scholarshipId } = (req as Request & { validated: endScholarshipZodType }).validated.body;
    const accountId = Number(req.tokenPayload.accountId);

    const user = await prismaGetAccountById(accountId);
    if (!user || user.role !== 'ISPSU_Head') {
      res.clearCookie('AdminToken', cookieOptionsStaff);
      res.status(404).json({ success: false, message: 'Account Did not Find!' });
      return;
    }

    const endScholar = await prismaEndScholarship(scholarshipId);
    if (!endScholar) {
      res.status(500).json({ success: false, message: 'Server Error!' });
      return;
    }
    res.status(200).json({ success: true, message: 'Scholarship Ended!', endedScholarship: endScholar });
    io.emit('endScholarship', {
      endedScholarship: endScholar.endedScholarship,
      endedApplications: endScholar.endenApplications,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteScholarship = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { scholarshipId } = (req as Request & { validated: deleteScholarshipZodType }).validated.body;
    const userId = Number(req.tokenPayload.accountId);
    const user = await prismaGetAccountById(userId);
    if (!user || user.role !== 'ISPSU_Head') {
      res.clearCookie('AdminToken', cookieOptionsStaff);
      res.status(401).json({ success: false, message: 'Account Did not Find!' });
      return;
    }

    const scholarship = await prismaGetScholarshipByArray(scholarshipId);
    if (!scholarship) {
      res.status(404).json({ success: false, message: 'Scholarship Did Not Find!' });
      return;
    }
    const deleteData: string[] = Object.values(scholarship.supabasePath as {});
    const DeleteScholarship = await prismaDeleteScholarship(scholarshipId);
    if (!DeleteScholarship) {
      res.status(400).json({ success: false, message: 'The Scholarship is Already Deleted!!' });
      return;
    }
    await DeleteSupabase(deleteData).catch((error) => console.log(error));
    let scholarshipStatus: string = '';
    if (scholarship.phase > 1 && new Date(scholarship.deadline).getTime() > Date.now()) {
      scholarshipStatus = 'RENEW';
    } else if (scholarship.ended === true) {
      scholarshipStatus = 'ENDED';
    } else if (new Date(scholarship.deadline).getTime() > Date.now()) {
      scholarshipStatus = 'ACTIVE';
    } else if (new Date(scholarship.deadline).getTime() < Date.now()) {
      scholarshipStatus = 'EXPIRED';
    }

    res.status(200).json({ success: true, message: 'Scholarship Deleted!!', scholarshipId, scholarshipStatus });
    io.emit('deleteScholarship', {
      deletedScholarship: scholarship,
      deletedApplicationsIds: scholarship.Application.map((f) => f.applicationId),
      scholarshipStatus,
    });

    const applicationIDs: { id: number; supabasePath: { [key: string]: string } }[] = scholarship.Application.map((e) => ({
      id: e.applicationId,
      supabasePath: e.supabasePath as { [key: string]: string },
    }));
    const batchIDs = chunkArray(applicationIDs, 20);

    for (let i = 0; i < batchIDs.length; i++) {
      const batch = batchIDs[i];

      await Promise.all(
        batch.map(async (app) => {
          await SupabaseDeletePrivateFile(Object.values(app.supabasePath));
        }),
      );
    }
  } catch (error) {
    next(error);
  }
};

export const getApplicationById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { applicationId } = (req as Request & { validated: getApplicationByIdZodType }).validated.query;
    const userId = Number(req.tokenPayload.accountId);

    const user = await prismaGetAccountById(userId);
    if (!user || (user.role !== 'ISPSU_Staff' && user.role !== 'ISPSU_Head')) {
      res.clearCookie('AdminToken', cookieOptionsStaff);
      res.status(401).json({ success: false, message: 'Account Did not Find!' });
      return;
    }

    const application = await prismaGetApplication(applicationId);
    if (!application) {
      res.status(404).json({ success: false, message: 'Data Did not found' });
      return;
    }

    res.status(200).json({ success: true, data: DenormalizeApplication(application) });
  } catch (error) {
    next(error);
  }
};

export const searchApplication = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search, status, sortBy, order, page, dataPerPage } = (req as Request & { validated: searchApplicationZodType }).validated.query;
    const userId = Number(req.tokenPayload.accountId);

    const user = await prismaGetAccountById(userId);
    if (!user || (user.role !== 'ISPSU_Staff' && user.role !== 'ISPSU_Head')) {
      res.clearCookie('AdminToken', cookieOptionsStaff);
      res.status(401).json({ success: false, message: 'Account Did not Find!' });
      return;
    }

    const allowedStatusFilter = ['DECLINED', 'PENDING', 'APPROVED'];

    const searchedApplication = await prismaSearchApplication(search, status, sortBy, order, page, dataPerPage);

    const meta = {
      page: page,
      pageSize: dataPerPage,
      totalRows: searchedApplication.totalCount,
      totalPage: Math.ceil(searchedApplication.totalCount / (dataPerPage ? dataPerPage : searchedApplication.totalCount)),
      sortBy: sortBy ? sortBy : 'default',
      order: order ? order : 'default',
      filters: JSON.stringify({
        ...(status && allowedStatusFilter.includes(status) ? { status: status } : undefined),
      }),
    };
    res.status(200).json({ data: searchedApplication.applications, meta });
  } catch (error) {
    next(error);
  }
};

export const getFilterData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { scholarshipStatus, applicationStatus } = (req as Request & { validated: getFilterDataZodType }).validated.query;
    const userId = Number(req.tokenPayload.accountId);

    const user = await prismaGetAccountById(userId);
    if (!user || (user.role !== 'ISPSU_Staff' && user.role !== 'ISPSU_Head')) {
      res.clearCookie('AdminToken', cookieOptionsStaff);
      res.status(401).json({ success: false, message: 'Account Did not Find!' });
      return;
    }

    const getScholarshipsFilters = await prismaFiltersScholarship(scholarshipStatus);
    const getFilterData = await prismaFiltersStudent(applicationStatus);

    res.status(200).json({ getFilterData, getScholarshipsFilters }); //{optionsScholarship, optionsApplication}
  } catch (error) {
    next(error);
  }
};

export const approveApplication = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { applicationId, scholarshipId, rejectMessage } = (req as Request & { validated: approveApplicationZodType }).validated.body;
    const userId = Number(req.tokenPayload.accountId);

    const user = await prismaGetAccountById(userId);

    if (!user || (user.role !== 'ISPSU_Staff' && user.role !== 'ISPSU_Head')) {
      res.clearCookie('AdminToken', cookieOptionsStaff);
      res.status(401).json({ success: false, message: 'Account Did not Find!' });
      return;
    }
    const checkApplication = await prismaGetApplicationByIdScholarshipId(applicationId, scholarshipId);
    if (!checkApplication) {
      res.status(404).json({ success: false, message: 'Application Did not Find' });
      return;
    }
    if (!checkApplication.scholarshipId) {
      res.status(404).json({ success: false, message: 'Scholarship Did not Find' });
      return;
    }
    if (!['PENDING', 'INTERVIEW'].includes(checkApplication.status)) {
      res.status(400).json({ success: false, message: `Application Already ${checkApplication.status}` });
      return;
    }
    const scholarship = await prismaGetScholarshipsById(scholarshipId);
    if (!scholarship) {
      res.status(404).json({ success: false, message: 'Scholarship Did No Find!' });
      return;
    }
    if (scholarship.ended) {
      res.status(400).json({ success: false, message: 'Scholarship Ended Cannot process Anymore!' });
      return;
    }
    if (scholarship.interview === true && checkApplication.status !== 'INTERVIEW') {
      res.status(400).json({ success: false, message: 'This Student is Not Interviewed Yet!' });
      return;
    }
    const checkApproveGov = await prismaCheckApproveGov(checkApplication.ownerId);
    if (checkApproveGov && scholarship.type === 'government') {
      res.status(400).json({
        success: false,
        message: 'This Student already have a Government Scholarship!',
        action: 'Application Blocked!',
      });
      await prismaBlockApplicationByApplicationId(applicationId);
      return;
    }

    const { Application, notification, BlockedApplications } = await prismaApproveApplication(applicationId, userId, rejectMessage, scholarship.phase);
    if (!Application) {
      res.status(500).json({ success: false, message: 'Server Error!' });
      return;
    }
    const applicantName: string = `${checkApplication?.Student?.lName}, ${checkApplication?.Student?.fName} ${checkApplication?.Student?.mName}`;
    const applicantStudentId: string = `${checkApplication.Student.Account.schoolId}`;
    const applicantEmail: string = `${checkApplication.Student.Account.email}`;
    const mailOptions: CreateEmailOptions = {
      from: 'service@edugrant.online',
      to: applicantEmail,
      subject: 'Approved Application',
      html: ApproveHTML(applicantName, applicantStudentId, applicantEmail),
    };
    const inGov = checkApproveGov ? true : false;

    sendApplicationUpdate(mailOptions);
    res.status(200).json({
      success: true,
      message: 'Application Approved!',
      approvedApplication: DenormalizeApplication(Application),
      BlockedApplications,
      notification: notification,
    });
    io.to(['ISPSU_Staff', 'ISPSU_Head', checkApplication.ownerId.toString()]).emit('approveApplication', {
      approvedApplication: DenormalizeApplication(Application),
      BlockedApplications,
      notification: notification,
    });
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034') {
      res.status(400).json({ success: false, message: 'This Application Has Been Processed!' });
      return;
    }
    next(error);
  }
};

export const forInterview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { applicationId, scholarshipId, rejectMessage } = (req as Request & { validated: forInterviewZondType }).validated.body;

    const accountId = Number(req.tokenPayload.accountId);

    const user = await prismaGetAccountById(accountId);
    if (!user || (user.role !== 'ISPSU_Staff' && user.role !== 'ISPSU_Head')) {
      res.clearCookie('AdminToken', cookieOptionsStaff);
      res.status(401).json({ success: false, message: 'Account Did not Find!' });
      return;
    }

    const checkApplication = await prismaGetApplicationByIdScholarshipId(applicationId, scholarshipId);
    if (!checkApplication) {
      res.status(404).json({ success: false, message: 'Application Did not Find!' });
      return;
    }
    if (!['PENDING'].includes(checkApplication.status)) {
      res.status(400).json({ success: false, message: `Application Is Already ${checkApplication.status}` });
      return;
    }
    const checkScholarship = await prismaGetScholarshipsById(scholarshipId);
    if (!checkScholarship) {
      res.status(404).json({ success: false, message: 'This Sholarship No Longet Exist' });
      return;
    }
    if (checkScholarship.ended) {
      res.status(400).json({ success: false, message: 'Scholarship Ended Cannot process Anymore!' });
      return;
    }
    if (checkScholarship.interview === false) {
      res.status(400).json({ success: false, message: 'This Sholarship Does not Required Interview!' });
      return;
    }

    const { interviewApplication, notification } = await prismaAcceptForInterview(applicationId, accountId, rejectMessage, checkScholarship.phase);
    if (!interviewApplication) {
      res.status(500).json({ success: false, message: 'Server Error!' });
      return;
    }
    const applicantName: string = `${checkApplication.Student.lName}, ${checkApplication.Student.fName} ${checkApplication.Student.mName}`;
    const applicantStudentId: string = `${checkApplication.Student.Account.schoolId}`;
    const applicantEmail: string = `${checkApplication.Student.Account.email}`;
    const mailOptions: CreateEmailOptions = {
      from: 'service@edugrant.online',
      to: checkApplication.Student.Account.email || '',
      subject: 'Approved Application',
      html: interviewHTML(applicantName, applicantStudentId, applicantEmail),
    };

    const checkApproveGov = await prismaCheckApproveGov(checkApplication.ownerId);
    const inGov = checkApproveGov ? true : false;

    sendApplicationUpdate(mailOptions);
    res.status(200).json({
      success: true,
      message: 'Application Is now For Interview!',
      interviewedApplication: DenormalizeApplication(interviewApplication),
      notification: notification,
      inGov,
    });
    io.to(['ISPSU_Staff', 'ISPSU_Head', checkApplication.Student.studentId.toString()]).emit('forInterview', {
      interviewApplication: DenormalizeApplication(interviewApplication),
      notification: notification,
      inGov,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034') {
      res.status(400).json({ success: false, message: 'This Application Has Been Processed!' });
      return;
    }
    next(error);
  }
};

export const declineApplication = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { applicationId, scholarshipId, rejectMessage } = (req as Request & { validated: declineApplicationZodType }).validated.body;
    const adminId = Number(req.tokenPayload.accountId);

    const user = await prismaGetAccountById(adminId);
    if (!user || (user.role !== 'ISPSU_Staff' && user.role !== 'ISPSU_Head')) {
      res.clearCookie('AdminToken', cookieOptionsStaff);
      res.status(401).json({ success: false, message: 'Account Did not Find!' });
      return;
    }

    const checkApplication = await prismaGetApplicationByIdScholarshipId(applicationId, scholarshipId);
    if (!checkApplication) {
      res.status(404).json({ success: false, message: 'Application Did not Find' });
      return;
    }
    if (!['PENDING', 'INTERVIEW'].includes(checkApplication.status)) {
      res.status(400).json({ success: false, message: `Application Already ${checkApplication.status}` });
      return;
    }

    const scholarship = await prismaGetScholarshipsById(scholarshipId);
    if (!scholarship) {
      res.status(404).json({ success: false, message: 'Scholarship Did No Find!' });
      return;
    }
    if (scholarship.ended) {
      res.status(400).json({ success: false, message: 'Scholarship Ended Cannot process Anymore!' });
      return;
    }

    const { declineApplication, notification } = await prismaDeclineApplication(applicationId, adminId, rejectMessage, scholarship.phase);
    if (!declineApplication) {
      res.status(500).json({ success: false, message: 'Server Error' });
      return;
    }
    const applicantName: string = `${checkApplication.Student.fName}, ${checkApplication.Student.lName} ${checkApplication.Student.mName}`;
    const applicantStudentId: string = `${checkApplication.Student.Account.schoolId}`;
    const applicantEmail: string = `${checkApplication.Student.Account.email}`;
    const mailOptions: CreateEmailOptions = {
      from: 'service@edugrant.online',
      to: applicantEmail || '',
      subject: 'Approved Application',
      html: declineHTML(applicantName, applicantStudentId, applicantEmail),
    };

    const checkApproveGov = await prismaCheckApproveGov(checkApplication.ownerId);
    const inGov = checkApproveGov ? true : false;

    sendApplicationUpdate(mailOptions);
    res.status(200).json({
      success: true,
      message: 'Application Declined!',
      declinedApplication: DenormalizeApplication(declineApplication),
      inGov,
    });
    io.to(['ISPSU_Staff', 'ISPSU_Head', checkApplication.Student.studentId.toString()]).emit('declineApplication', {
      declineApplication: DenormalizeApplication(declineApplication),
      notification: notification,
      inGov,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034') {
      res.status(400).json({ success: false, message: 'This Application Has Been Processed!' });
      return;
    }
    next(error);
  }
};

export const getApplication = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, page, dataPerPage, sortBy, order, filters, scholarshipId } = (req as Request & { validated: getApplicationZodType }).validated.query;
    const userId = Number(req.tokenPayload.accountId);

    const user = await prismaGetAccountById(userId);
    if (!user || (user.role !== 'ISPSU_Staff' && user.role !== 'ISPSU_Head')) {
      res.clearCookie('AdminToken', cookieOptionsStaff);
      res.status(401).json({ success: false, message: 'Account Did not Find!' });
      return;
    }

    const getApplication = await prismaGetAllApplication(status, page, dataPerPage, sortBy, order, filters, scholarshipId);

    const meta = {
      counts: getApplication.countsByStatus,
      page: page,
      pageSize: dataPerPage,
      totalRows: getApplication.applicationsCount,
      totalPage: Math.ceil(getApplication.applicationsCount / (dataPerPage ? dataPerPage : getApplication.applicationsCount)),
      sortBy: sortBy ? sortBy : 'default',
      order: order ? order : 'default',
      filters: filters?.map((data) => data.id),
    };
    res.status(200).json({ success: true, data: getApplication.applications.flat(3), meta });
    return;
  } catch (error) {
    next(error);
  }
};

export const getFileUrl = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { path, applicationId } = (req as Request & { validated: getFileUrlZodType }).validated.body;
    const adminId = Number(req.tokenPayload.accountId);

    const user = await prismaGetAccountById(adminId);
    if (!user || (user.role !== 'ISPSU_Head' && user.role !== 'ISPSU_Staff')) {
      res.clearCookie('AdminToken', cookieOptionsStaff);
      res.status(401).json({ success: false, message: 'Account Did not Find!' });
      return;
    }

    const checkApplication = await prismaGetApplication(applicationId);
    if (!checkApplication) {
      res.status(404).json({ success: false, message: 'Application Did not Find!' });
      return;
    }
    if (!(checkApplication.supabasePath as string[]).find((f) => f === path)) {
      res.status(404).json({ success: false, message: 'This Path is not from this Application!' });
      return;
    }

    const URL = await SupabaseCreateSignedUrl(path);
    if (!URL.success || !URL.signedURLs) {
      res.status(500).json({ success: false, message: URL.message });
      return;
    }

    res.status(200).json({ success: true, message: 'URL Genarated!', signedURL: URL.signedURLs });
  } catch (error) {
    next(error);
  }
};

export const downloadApplicationFile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { path, applicationId } = (req as Request & { validated: downloadApplicationFileZodType }).validated.body;
    const adminId = Number(req.tokenPayload.accountId);

    const user = await prismaGetAccountById(adminId);
    if (!user || (user.role !== 'ISPSU_Head' && user.role !== 'ISPSU_Staff')) {
      res.clearCookie('AdminToken', cookieOptionsStaff);
      res.status(401).json({ success: false, message: 'Account Did not Find!' });
      return;
    }

    const checkApplication = await prismaGetApplication(applicationId);
    if (!checkApplication) {
      res.status(404).json({ success: false, message: 'Application Did not Find!' });
      return;
    }
    if (!(checkApplication.supabasePath as string[]).find((f) => f === path)) {
      res.status(404).json({ success: false, message: 'This Path is not from this Application!' });
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

export const createAnnouncement = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { announcementTitle, announcementDescription, announcementTags } = (req as Request & { validated: createAnnouncementZodType }).validated.body;
    const adminId = Number(req.tokenPayload.accountId);

    const user = await prismaGetAccountById(adminId);
    if (!user || user.role !== 'ISPSU_Head') {
      res.clearCookie('AdminToken', cookieOptionsStaff);
      res.status(401).json({ success: false, message: 'Account Did not Find!' });
      return;
    }

    if (announcementTags && !Array.isArray(announcementTags.data)) {
      res.status(400).json({ success: false, message: 'Invalid Array Format!' });
      return;
    }

    const newAnnouncement = await prismaCreateAnnouncement(adminId, announcementTitle, announcementDescription, announcementTags);
    if (!newAnnouncement) {
      res.status(500).json({ success: false, message: 'Database Error!' });
      return;
    }
    res.status(200).json({ success: true, message: 'Announcement Created!' });
    io.emit('createAnnouncement', { newAnnouncement });
  } catch (error) {
    next(error);
  }
};

export const getAnnouncement = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, dataPerPage, sortBy, order, status, search } = (req as Request & { validated: getAnnouncementZodType }).validated.query;
    const userId = Number(req.tokenPayload.accountId);

    const user = await prismaGetAccountById(userId);
    if (!user || (user.role !== 'ISPSU_Staff' && user.role !== 'ISPSU_Head')) {
      res.clearCookie('AdminToken', cookieOptionsStaff);
      res.status(401).json({ success: false, message: 'Account Did not Find!' });
      return;
    }

    const getData = await prismaGetAllAnnouncement(page, dataPerPage, sortBy, order, status, search);

    const meta = {
      page: page,
      pageSize: dataPerPage,
      totalRows: getData.totalCount,
      totalPage: Math.ceil(getData.totalCount / (dataPerPage || getData.totalCount)),
      sortBy: sortBy ? sortBy : 'default',
      order: order ? order : 'default',
      filters: JSON.stringify({}),
    };

    res.status(200).json({ announcements: getData.announcements, meta });
  } catch (error) {
    next(error);
  }
};
export const getAnnouncementById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { announcementId } = (req as Request & { validated: getAnnouncementByIdZodType }).validated.query;
    const userId = Number(req.tokenPayload.accountId);

    const user = await prismaGetAccountById(userId);
    if (!user || (user.role !== 'ISPSU_Staff' && user.role !== 'ISPSU_Head')) {
      res.clearCookie('AdminToken', cookieOptionsStaff);
      res.status(401).json({ success: false, message: 'Account Did not Find!' });
      return;
    }

    const annoucement = await prismaGetAnnouncementById(announcementId);
    res.status(200).json({ success: true, annoucement });
  } catch (error) {
    next(error);
  }
};
export const deleteAnnouncement = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { announcementId } = (req as Request & { validated: deleteAnnouncementZodType }).validated.body;
    const userId = Number(req.tokenPayload.accountId);

    const user = await prismaGetAccountById(userId);
    if (!user || (user.role !== 'ISPSU_Staff' && user.role !== 'ISPSU_Head')) {
      res.clearCookie('AdminToken', cookieOptionsStaff);
      res.status(401).json({ success: false, message: 'Account Did not Find!' });
      return;
    }

    const deleteAnnouncement = await prismaDeleteAnnouncement(announcementId);
    if (!deleteAnnouncement) {
      res.status(500).json({ success: false, message: 'Server Error!' });
      return;
    }
    res.status(200).json({ success: true, message: 'Announcement Deleted!', announcementId });
    io.emit('deleteAnnouncement', { deleteAnnouncement });
  } catch (error) {
    next(error);
  }
};
export const editAnnouncement = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { announcementId, title, description, tags } = (req as Request & { validated: editAnnouncementZodType }).validated.body;

    const userId = Number(req.tokenPayload.accountId);
    const user = await prismaGetAccountById(userId);
    if (!user || (user.role !== 'ISPSU_Staff' && user.role !== 'ISPSU_Head')) {
      res.clearCookie('AdminToken', cookieOptionsStaff);
      res.status(401).json({ success: false, message: 'Account Did not Find!' });
      return;
    }

    const update = await prismaEditAnnouncement(announcementId, title, description, tags);
    if (!update) {
      res.status(500).json({ success: false, message: 'Server Error!' });
      return;
    }
    res.status(200).json({ success: true, message: 'Announcement Updated!', announcement: update });
  } catch (error) {
    next(error);
  }
};
export const getStaffLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, dataPerPage, sortBy, order, ownderId, filters } = (req as Request & { validated: getStaffLogsZodType }).validated.query;
    const accountId = Number(req.tokenPayload.accountId);

    const user = await prismaGetAccountById(accountId);
    if (!user || (user.role !== 'ISPSU_Staff' && user.role !== 'ISPSU_Head')) {
      res.clearCookie('AdminToken', cookieOptionsStaff);
      res.status(401).json({ success: false, message: 'Account Did not Find!' });
      return;
    }

    const isStaff = user.role === 'ISPSU_Staff' ? accountId : undefined;
    const isHead: boolean = user.role === 'ISPSU_Head';
    const { logs, totalCount } = await prismaGetStaffLogs(isHead, page, dataPerPage, sortBy, order, isStaff, filters);

    const meta = {
      page: page || 'default',
      pageSize: dataPerPage || 'default',
      totalRows: totalCount,
      totalPage: dataPerPage ? Math.ceil(totalCount / dataPerPage) : 1,
      sortBy: sortBy ? sortBy : 'default',
      order: order ? order : 'default',
      filters: JSON.stringify({}),
    };

    res.status(200).json({ success: true, Staff_Logs: logs, meta });
  } catch (error) {
    next(error);
  }
};
export const updateStudentAccount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { ownerId, email, newPassword, schoolId, fName, lName, mName, contactNumber, gender, address, indigenous, PWD, institute, course, year, section, dateOfBirth } = (
      req as Request & { validated: updateStudentAccountZodType }
    ).validated.body;

    const userId = Number(req.tokenPayload.accountId);

    const user = await prismaGetAccountById(userId);
    if (!user || (user.role !== 'ISPSU_Staff' && user.role !== 'ISPSU_Head')) {
      res.clearCookie('AdminToken', cookieOptionsStaff);
      res.status(401).json({ success: false, message: 'Account Did not Find!' });
      return;
    }

    const checkStudentAccount = await prismaGetStudentById(ownerId);
    if (!checkStudentAccount) {
      res.status(404).json({ success: false, message: 'Account Not Found!' });
      return;
    }
    if (checkStudentAccount.Account.role !== 'Student') {
      res.status(400).json({ success: false, message: 'Account is Not a Student Account!' });
      return;
    }
    let newHashedPass = undefined;
    if (newPassword) {
      newHashedPass = await hash(newPassword, 10);
    }
    const update = await prismaHEADUpdateStudentAccount(
      ownerId,
      email,
      newHashedPass,
      schoolId,
      fName,
      lName,
      mName,
      contactNumber,
      gender,
      address,
      indigenous,
      PWD,
      institute,
      course,
      year,
      section,
      dateOfBirth,
    );
    if (!update) {
      res.status(404).json({ success: false, message: 'Account Not Found!' });
      return;
    }
    const { hashedPassword, ...updatedStudent } = update;

    res.status(200).json({ success: true, message: 'Account Updated!', updatedStudent });
  } catch (error) {
    next(error);
  }
};
export const deleteStudent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { ownerId } = (req as Request & { validated: deleteStudentZodType }).validated.body;

    const userId = Number(req.tokenPayload.accountId);

    const user = await prismaGetAccountById(userId);
    if (!user || user.role !== 'ISPSU_Head') {
      res.clearCookie('AdminToken', cookieOptionsStaff);
      res.status(401).json({ success: false, message: 'Account Did not Find!' });
      return;
    }

    const checkStudentAccount = await prismaGetStudentById(ownerId);
    if (!checkStudentAccount) {
      res.status(404).json({ success: false, message: 'Account Not Found!' });
      return;
    }
    if (checkStudentAccount.Account.role !== 'Student') {
      res.status(400).json({ success: false, message: 'Account is Not a Student Account!' });
      return;
    }

    const deleteStudent = await prismaDeleteAccount([ownerId]);
    if (!deleteStudent) {
      res.status(500).json({ success: false, message: 'Server Error!' });
      return;
    }

    res.status(200).json({ success: true, message: 'Student Account Deleted!' });
    for (const value of checkStudentAccount.Application) {
      await SupabaseDeletePrivateFile(value.supabasePath as string[]).catch((error) => console.log(error));
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  } catch (error) {
    next(error);
  }
};
export const getStudents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, dataPerPage, sortBy, order, ownderId, filters } = (req as Request & { validated: getStudentsZodType }).validated.query;

    const userId = Number(req.tokenPayload.accountId);

    const user = await prismaGetAccountById(userId);
    if (!user || (user.role !== 'ISPSU_Staff' && user.role !== 'ISPSU_Head')) {
      res.clearCookie('AdminToken', cookieOptionsStaff);
      res.status(401).json({ success: false, message: 'Account Did not Find!' });
      return;
    }

    const students = await prismaGetStudents(page, dataPerPage, sortBy, order, ownderId, filters);

    const meta = {
      page: page || 'default',
      pageSize: dataPerPage || 'default',
      totalRows: students.totalCount,
      totalPage: dataPerPage ? Math.ceil(students.totalCount / dataPerPage) : 1,
      sortBy: sortBy ? sortBy : 'default',
      order: order ? order : 'default',
      filters: JSON.stringify({}),
    };

    res.status(200).json({ students: students.students, meta });
  } catch (error) {
    next(error);
  }
};
export const getStudentsById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { ownerId } = (req as Request & { validated: getStudentsByIdZodType }).validated.query;
    const userId = Number(req.tokenPayload.accountId);

    const user = await prismaGetAccountById(userId);
    if (!user || (user.role !== 'ISPSU_Staff' && user.role !== 'ISPSU_Head')) {
      res.clearCookie('AdminToken', cookieOptionsStaff);
      res.status(401).json({ success: false, message: 'Account Did not Find!' });
      return;
    }

    const checkStudentAccount = await prismaGetStudentById(ownerId);
    if (!checkStudentAccount) {
      res.status(404).json({ success: false, message: 'Account Not Found!' });
      return;
    }
    if (checkStudentAccount.Account.role !== 'Student') {
      res.status(400).json({ success: false, message: 'Account is Not a Student Account!' });
      return;
    }

    res.status(200).json({ success: true, student: checkStudentAccount });
  } catch (error) {
    next(error);
  }
};
export const searchStudent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search, page, dataPerPage, sortBy, order, ownderId, filters } = (req as Request & { validated: searchStudentZodType }).validated.query;

    const userId = Number(req.tokenPayload.accountId);

    const user = await prismaGetAccountById(userId);
    if (!user || (user.role !== 'ISPSU_Staff' && user.role !== 'ISPSU_Head')) {
      res.clearCookie('AdminToken', cookieOptionsStaff);
      res.status(401).json({ success: false, message: 'Account Did not Find!' });
      return;
    }

    const students = await prismaSearchStudents(search, page, dataPerPage, sortBy, order, ownderId, filters);

    const meta = {
      page: page || 'default',
      pageSize: dataPerPage || 'default',
      totalRows: students.totalCount,
      totalPage: dataPerPage ? Math.ceil(students.totalCount / dataPerPage) : 1,
      sortBy: sortBy ? sortBy : 'default',
      order: order ? order : 'default',
      filters: JSON.stringify({}),
    };

    res.status(200).json({ students: students.students, meta });
  } catch (error) {
    next(error);
  }
};
export const getFiltersCSV = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { scholarship, applicationStatus, studentInstitute, studentCourse, studentYear, studentSection } = (req as Request & { validated: getFiltersCSVZodType }).validated.query;
    const userId = Number(req.tokenPayload.accountId);

    const user = await prismaGetAccountById(userId);
    if (!user || (user.role !== 'ISPSU_Staff' && user.role !== 'ISPSU_Head')) {
      res.clearCookie('AdminToken', cookieOptionsStaff);
      res.status(401).json({ success: false, message: 'Account Did not Find!' });
      return;
    }

    const getFiltersForApplicationsCSV = await prismaGetFiltersForApplicationsCSV(scholarship, applicationStatus, studentInstitute, studentCourse, studentYear, studentSection);
    const dataSelections = [
      'status',
      'title',
      'name',
      'fName',
      'lName',
      'mName',
      'contactNumber',
      'gender',
      'address',
      'indigenous',
      'PWD',
      'institute',
      'course',
      'year',
      'section',
      'dateOfBirth',
      'schoolId',
      'email',
      'Mother Taxable Income',
      'Father Taxable Income',
      'Guardian Taxable Income',
      'Total Taxable Income',
    ];

    res.status(200).json({ success: true, filters: getFiltersForApplicationsCSV, dataSelections });
  } catch (error) {
    next(error);
  }
};
export const downloadApplicationCSV = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { filters, dataSelections, AtoZ, order, gender } = (req as Request & { validated: downloadApplicationCSVZodType }).validated.query;
    const userId = Number(req.tokenPayload.accountId);

    const user = await prismaGetAccountById(userId);
    if (!user || (user.role !== 'ISPSU_Staff' && user.role !== 'ISPSU_Head')) {
      res.clearCookie('AdminToken', cookieOptionsStaff);
      res.status(401).json({ success: false, message: 'Account Did not Find!' });
      return;
    }

    const ApplicationsCSV = await prismaGetApplicationsCSV(dataSelections, filters, AtoZ, order, gender);
    if (ApplicationsCSV.length === 0) {
      res.status(404).json({ success: false, message: 'No Record Found!' });
      return;
    }

    await ExportToExcel(ApplicationsCSV, 'Applications', res);
  } catch (error) {
    next(error);
  }
};
export const getFiltersStudentsCSV = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = Number(req.tokenPayload.accountId);

    const user = await prismaGetAccountById(userId);
    if (!user || (user.role !== 'ISPSU_Staff' && user.role !== 'ISPSU_Head')) {
      res.clearCookie('AdminToken', cookieOptionsStaff);
      res.status(401).json({ success: false, message: 'Account Did not Find!' });
      return;
    }

    const filters = await prismaGetFiltersStudentCSV();

    res.status(200).json({ success: true, filters });
  } catch (error) {
    next(error);
  }
};
export const downloadStudentsCSV = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { filters, dataSelections } = (req as Request & { validated: downloadStudentsCSVZodType }).validated.query;
    const userId = Number(req.tokenPayload.accountId);

    const user = await prismaGetAccountById(userId);
    if (!user || (user.role !== 'ISPSU_Staff' && user.role !== 'ISPSU_Head')) {
      res.clearCookie('AdminToken', cookieOptionsStaff);
      res.status(401).json({ success: false, message: 'Account Did not Find!' });
      return;
    }

    const StudentsCSV = await prismaExportCSV(filters, dataSelections);
    if (StudentsCSV.length === 0) {
      res.status(404).json({ success: false, message: 'No Record Found!' });
      return;
    }

    await ExportToExcel(StudentsCSV, 'Student Records', res);
  } catch (error) {
    next(error);
  }
};
