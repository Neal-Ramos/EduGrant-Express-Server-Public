import { NextFunction, Request, Response } from "express"
import { getAnnouncementsZodType } from "../Validator/ZodSchemaUserPost"
import { prismaGetAllAnnouncement } from "../Models/AnnouncementModels"
import { WasabiCreateSignedURL, WasabiUpload } from "../Config/Wasabi"


export const uploadWasabi = async(req: Request, res: Response, next: NextFunction): Promise<void>=> {
    try {
        const file: Express.Multer.File|undefined = (req.files as Express.Multer.File[]).find(f => f.fieldname === "IMG")
        if(!file){
            res.status(404).json()
            return
        }
        const uploadFile = await WasabiUpload(file, "Test-Files")
        if(!uploadFile.success || !uploadFile.path){
            res.status(500).json()
            return
        }
        const url = await WasabiCreateSignedURL(uploadFile.path)

        res.status(200).json(url)
    } catch (error) {
        next(error)
    }
}
export const getAnnouncementsPublic = async(req: Request, res: Response, next: NextFunction): Promise<void>=> {
    try {
        const {page, dataPerPage, sortBy, order, status} = (req as Request & {validated: getAnnouncementsZodType}).validated.query

        const announcements = await prismaGetAllAnnouncement(page, dataPerPage, sortBy, order, status)

        const meta = {
            page: page,
            pageSize: dataPerPage,
            totalRows:announcements.totalCount,
            totalPage:Math.ceil(announcements.totalCount/(dataPerPage || announcements.totalCount)),
            sortBy:sortBy? sortBy:"default",
            order:order? order:"default",
            filters:null
        }

        res.status(200).json({announcements: announcements.announcements, meta})
    } catch (error) {
        next(error)
    }
}