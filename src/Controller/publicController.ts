import { NextFunction, Request, Response } from 'express';
import { getAnnouncementsZodType } from '../Validator/ZodSchemaUserPost';
import { prismaGetAllAnnouncement } from '../Models/AnnouncementModels';
import { WasabiCreateSignedURL, WasabiUpload } from '../Config/Wasabi';
import { getScholarshipZodType } from '../Validator/ZodSchemaAdminPost';
import { prismaGetScholarship } from '../Models/ScholarshipModels';

export const uploadWasabi = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const file: Express.Multer.File | undefined = (req.files as Express.Multer.File[]).find((f) => f.fieldname === 'IMG');
    if (!file) {
      res.status(404).json();
      return;
    }
    const uploadFile = await WasabiUpload(file, 'Test-Files');
    if (!uploadFile.success || !uploadFile.path) {
      res.status(500).json();
      return;
    }
    const url = await WasabiCreateSignedURL(uploadFile.path);

    res.status(200).json(url);
  } catch (error) {
    next(error);
  }
};
export const getAnnouncementsPublic = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, dataPerPage, sortBy, order, status } = (req as Request & { validated: getAnnouncementsZodType }).validated.query;

    const announcements = await prismaGetAllAnnouncement(page, dataPerPage, sortBy, order, status);

    const meta = {
      page: page,
      pageSize: dataPerPage,
      totalRows: announcements.totalCount,
      totalPage: Math.ceil(announcements.totalCount / (dataPerPage || announcements.totalCount)),
      sortBy: sortBy ? sortBy : 'default',
      order: order ? order : 'default',
      filters: null,
    };

    res.status(200).json({ announcements: announcements.announcements, meta });
  } catch (error) {
    next(error);
  }
};
export const getScholarshipPublic = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { dataPerPage, page, sortBy, order, status, filters, search } = (req as Request & { validated: getScholarshipZodType }).validated.query;

    const { scholarship, totalCount, countActive, countRenew, countExpired } = await prismaGetScholarship(page, dataPerPage, sortBy, order, status, filters, undefined, search);

    const safeScholarships = scholarship.map(e => {
      const {Application, ...safe} = e
      return safe
    })
    const meta = {
      page: page,
      pageSize: dataPerPage,
      totalRows: totalCount,
      totalPage: Math.ceil(totalCount / (dataPerPage || totalCount)),
      sortBy: sortBy ? sortBy : 'default',
      order: order ? order : 'default',
      filters: (filters as {id: string}[] | undefined)?.map((e) => e.id),
    };

    res.status(200).json({ success: true, scholarship: safeScholarships, totalCount, countActive, countRenew, countExpired, meta });
  } catch (error) {
    next(error)
  }
};
