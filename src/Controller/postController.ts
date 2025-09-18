import { Response, Request, NextFunction } from "express"
import { PrismaClient } from "@prisma/client"
import { ScholarshipApplicationData } from "../Types/postControllerTypes"
import { filtersDataTypes } from "../Types/adminPostControllerTypes";
import { ResponseUploadSupabase, UploadSupabase } from "../Config/Supabase"
import { applyScholarshipZodType, getAllScholarshipZodType, getAnnouncementsZodType, getApplicationsZodType, getNotificationsZodType, getRenewScholarshipZodType, getScholarshipsByIdZodType, getStudentByIdZodType } from "../Zod/ZodSchemaUserPost"
import { prismaGetRenewScholarship, prismaGetScholarship, prismaGetScholarshipsById } from "../Models/ScholarshipModels";
import { prismaCheckApplicationDuplicate, prismaCheckApproveGov, prismaCreateApplication, prismaGetAllAccountApplication } from "../Models/ApplicationModels";
import { prismaGetAccountById } from "../Models/AccountModels";
import { prismaGetAllAnnouncement } from "../Models/AnnouncementModels";
import { prismaGetAllNotifications } from "../Models/Student_NotificationModels";

const prisma = new PrismaClient()

export const getAllScholarship = async (req: Request, res: Response, next: NextFunction): Promise<void>=> {
    try {
        const {page, dataPerPage, sortBy, order, status , filters, accountId} = (req as Request & {validated:getAllScholarshipZodType}).validated.query

        const checkAccount = await prismaGetAccountById(accountId)
        if(!checkAccount){
            res.status(404).json({success: false, message: "Account Did Not Found!"})
            return
        }
        if(!checkAccount.Student?.familyBackground || Object.entries(checkAccount.Student?.familyBackground).length === 0){
            res.status(401).json({success: false, message: "Need To Finish Account Setup"})
            return
        }

        const getScholarshipsData = await prismaGetScholarship(page, dataPerPage, sortBy, order, status , filters)
        const meta = {
            page: page,
            pageSize: dataPerPage,
            totalRows:getScholarshipsData.totalCount,
            totalPage:Math.ceil(getScholarshipsData.totalCount/(dataPerPage || getScholarshipsData.totalCount)),
            sortBy:sortBy? sortBy:"default",
            order:order? order:"default",
            filters:JSON.stringify(filters?.map((f: filtersDataTypes) => f.id))
        }
        res.status(200).json({data:getScholarshipsData.scholarship, meta});
    } catch (error) {
        next(error)
    }
}
export const getRenewScholarship = async(req: Request, res: Response, next: NextFunction): Promise<void>=> {
    try {
        const {dataPerPage, page, sortBy, order, status, filters, accountId} = (req as Request & {validated: getRenewScholarshipZodType}).validated.query
        
        const checkAccount = await prismaGetAccountById(accountId)
        if(!checkAccount){
            res.status(404).json({success: false, message: "Account Did Not Found!"})
            return
        }
        if(!checkAccount.Student?.familyBackground || Object.entries(checkAccount.Student?.familyBackground).length === 0){
            res.status(401).json({success: false, message: "Need To Finish Account Setup"})
            return
        }

        const getScholarshipsData = await prismaGetRenewScholarship(page, dataPerPage, sortBy, order, status , filters, accountId)
        const meta = {
            page: page,
            pageSize: dataPerPage,
            totalRows:getScholarshipsData.totalCount,
            totalPage:Math.ceil(getScholarshipsData.totalCount/(dataPerPage || getScholarshipsData.totalCount)),
            sortBy:sortBy? sortBy:"default",
            order:order? order:"default",
            filters:JSON.stringify(filters?.map((f: filtersDataTypes) => f.id))
        }
        res.status(200).json({data:getScholarshipsData.scholarship, meta});
    } catch (error) {
        next(error)
    }
}
export const getScholarshipsbyId = async (req: Request, res: Response, next: NextFunction): Promise<void>=> {
    try {
        const {scholarshipId} = (req as Request & {validated: getScholarshipsByIdZodType}).validated.query
        
        const getScholarshipsById = await prismaGetScholarshipsById(scholarshipId)
        res.status(200).json({success:true, message:"Get Success!", scholarship: getScholarshipsById});
    } catch (error) {
        next(error)
    }
}
export const applyScholarship = async (req: Request, res: Response, next: NextFunction): Promise<void>=> {
    try {
        const {accountId, scholarshipId} = (req as Request & {validated: applyScholarshipZodType}).validated.body
        
        type DocumentEntry = Record<number, {
            label: string;
            formats: string[];
            requirementType: string;
        }>;
        
        const checkScholarship = await prismaGetScholarshipsById(scholarshipId)
        if(!checkScholarship){
            res.status(403).json({success: false, message: "Scholarship Inactive!"})
            return
        }
        if(new Date(checkScholarship.deadline) < new Date()){
            res.status(403).json({success: false, message: "Scholarship Inactive!"})
            return
        }
        const checkIfInGovScholarship = await prismaCheckApproveGov(accountId)
        if(checkIfInGovScholarship && checkScholarship.type === "government"){
            res.status(403).json({success: false, message: "Already have a Approved Goverment Scholarship"})
            return
        }
        const applicationDuplicate = await prismaCheckApplicationDuplicate(accountId, scholarshipId)
        if(applicationDuplicate){
            res.status(409).json({success: false, message:"You already have an application for this Scholarship!"});
            return
        }
        const rawFileNames: DocumentEntry = checkScholarship? {...((checkScholarship?.documents as {documents: DocumentEntry})?.documents)}:{}
        for(const [key, value] of Object.entries((checkScholarship?.documents as {documents: DocumentEntry})?.documents as DocumentEntry)){
            const check = (req.files as Express.Multer.File[]).find(file => file.fieldname === value.label)
            if(!check && value.requirementType === "required"){
                res.status(400).json({success: false, message: "File Requirements Did not met!"})
                return
            }
        }
        const fileRequirements: ScholarshipApplicationData = {
            submittedDocuments:{},
            supabasePath:[]
        }
        for(const key in rawFileNames){
            const upload = (req.files as Express.Multer.File[]).find(file => file.fieldname === rawFileNames[key].label)

            const uploadResult: ResponseUploadSupabase | undefined = upload? await UploadSupabase(upload, "student-application-files"):undefined
            fileRequirements.submittedDocuments[rawFileNames[key].label] = {
                document: rawFileNames[key].label,
                supabasePath:upload && uploadResult? uploadResult.path: "",
                fileUrl:upload && uploadResult? uploadResult.publicUrl: "",
                fileFormat:upload? upload.mimetype: "",
                resourceType:upload? upload.mimetype: "",
                requirementType:rawFileNames[key].requirementType
            }
            fileRequirements.supabasePath.push(uploadResult? uploadResult.path: "")
        }
        const insertApplication = await prismaCreateApplication(fileRequirements, accountId, scholarshipId)
        if(!insertApplication){
            res.status(500).json({success: false, message:"Server Error!!!"})
            return;
        }
        res.status(200).json({success:true})
    } catch (error) {
        next(error)
    }
}
export const applyRenewScholarship = async(req: Request, res: Response, next: NextFunction): Promise<void>=> {
    try {
        const {accountId, scholarshipId} = (req as Request&{validated: applyScholarshipZodType}).validated.body

        const checkAccount = await prismaGetAccountById(accountId)
        if(!checkAccount){
            res.status(404).json({success: false, message: "Account Did Not Found!"})
            return
        }
        if(checkAccount.role !== "Student"){
            res.status(401).json({success: false, message: "This Account Is not Allowed To Apply Scholarship"})
            return
        }

        const checkScholarship = await prismaGetScholarshipsById(scholarshipId)
        if(!checkScholarship){
            res.status(404).json({success: false, message: "Scholarship Did not Found!"})
            return
        }
        if(new Date(checkScholarship.deadline) < new Date()){
            res.status(409).json({success: false, message: "Scholarship Is Not Active!"})
            return
        }
        
        const checkPrevApplication = await prismaCheckApplicationDuplicate(accountId, scholarshipId)
        if(!checkPrevApplication){
            res.status(401).json({success: false, message: "You Are not Qualified For this Scholarship!"})
            return
        }

        res.status(200).json({success: true, message: "Application Submitted!"})
    } catch (error) {
        next(error)
    }
}
export const getStudentById = async(req: Request, res: Response, next: NextFunction): Promise<void>=> {
    try {
        const  {accountId} = (req as Request & {validated: getStudentByIdZodType}).validated.query
        const getUser = await prismaGetAccountById(accountId)
        if(!getUser){
            res.status(400).json({success: false, message: "User Does not Exist!!"});
            return;
        }
        const {hashedPassword, ...safeData} = getUser
        res.status(200).json({success: true, userData: safeData})
    } catch (error) {
        next(error);
    }
}
export const getAnnouncements = async (req: Request, res: Response, next: NextFunction): Promise<void>=> {
    try {
        const {
            page,
            dataPerPage,
            sortBy,
            order,
            status,
        } = (req as Request & {validated: getAnnouncementsZodType}).validated.query

        const annoucement = await prismaGetAllAnnouncement( page, dataPerPage, sortBy, order, status,)
        const meta = {
            page: page || "all",
            pageSize: dataPerPage || "all",
            totalRows:annoucement.totalCount,
            totalPage:Math.ceil(annoucement.totalCount/(dataPerPage || annoucement.totalCount)),
            sortBy:sortBy? sortBy:"default",
            order:order? order:"default",
            filters:"default"
        }
        res.status(200).json({annoucements: annoucement.announcements, meta})
    } catch (error) {
        next(error)
    }
}
export const getNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void>=> {
    try {
        const {accountId, page, dataPerPage, status, sortBy, order} = (req as Request & {validated: getNotificationsZodType}).validated.query
        const notification = await prismaGetAllNotifications(accountId, page, dataPerPage, status, sortBy, order) 

        const meta = {
            page: page || "all",
            pageSize: dataPerPage || "all",
            totalRows:notification.totalCount,
            totalPage:Math.ceil(notification.totalCount/(dataPerPage || notification.totalCount)),
            sortBy:sortBy? sortBy:"default",
            order:order? order:"default",
            filters:"default"
        }
        res.status(200).json({notification: notification.notification, meta})
        return
    } catch (error) {
        next(error)
    }
}
export const getApplications = async (req: Request, res: Response, next: NextFunction): Promise<void>=> {
    try {
        const {accountId, page, dataPerPage, applicationId, sortBy, status, filter, order} = (req as Request & {validated: getApplicationsZodType}).validated.query

        const getData = await prismaGetAllAccountApplication(status, page, dataPerPage, sortBy, order,  filter, undefined ,applicationId, accountId)
        
        const meta = {
            page: page,
            pageSize: dataPerPage,
            totalRows:getData.totalCount,
            totalPage:Math.ceil(getData.totalCount/(dataPerPage || getData.totalCount)),
            sortBy:sortBy? sortBy:"default",
            order:order? order:"default",
            filters:filter? filter.map((f : Array<{id:string, value: string}>) => f):"default"
        }
        res.status(200).json({success: true, applications: getData.applications, meta})
    } catch (error) {
        next(error)
    }
}