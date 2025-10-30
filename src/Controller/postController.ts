import { Response, Request, NextFunction } from "express"
import { filtersDataTypes } from "../Types/adminPostControllerTypes";
import { ResponseUploadSupabase, ResponseUploadSupabasePrivate, SupabaseDeletePrivateFile, UploadSupabase, UploadSupabasePrivate } from "../Config/Supabase"
import { applyScholarshipZodType, getAllScholarshipZodType, getAnnouncementsByIdZodType, getAnnouncementsZodType, getApplicationHistoryZodType, getApplicationsZodType, getNotificationsZodType, getScholarshipsByIdZodType, getStudentApplicationByIdZodType, getStudentByIdZodType, searchScholarshipZodType } from "../Zod/ZodSchemaUserPost"
import { prismaGetRenewScholarship, prismaGetScholarship, prismaGetScholarshipsById, prismaSearchScholarshipTitle, prismaStudentCountsInToken } from "../Models/ScholarshipModels";
import { prismaCheckApplicationDuplicate, prismaCheckApproveGov, prismaCreateApplication, prismaGetAllAccountApplication, prismaGetApplication, prismaGetApplicationHistory, prismaRenewApplication, prismaSearchApplication } from "../Models/ApplicationModels";
import { prismaGetAccountById } from "../Models/AccountModels";
import { prismaGetAllAnnouncement, prismaGetAnnouncementById } from "../Models/AnnouncementModels";
import { prismaGetAllNotifications, prismaGetUnreadNotificationsCount } from "../Models/Student_NotificationModels";
import { DocumentEntry, RecordApplicationFilesTypes, RecordDocumentEntry } from "../Types/postControllerTypes";
import { cookieOptionsStudent } from "../Config/TokenAuth";
import { normalizeString } from "../Config/normalizeString";
import { io } from "..";

export const getAllScholarship = async (req: Request, res: Response, next: NextFunction): Promise<void>=> {
    try {
        const {page, dataPerPage, sortBy, order, status , filters} = (req as Request & {validated:getAllScholarshipZodType}).validated.query
        const accountId = Number(req.tokenPayload.accountId)

        const checkAccount = await prismaGetAccountById(accountId)
        if(!checkAccount || checkAccount.role !== "Student"){
            res.clearCookie("token", cookieOptionsStudent);
            res.status(401).json({success: false, message: "Account Did not Find!"})
            return
        }
        if(!checkAccount.Student?.familyBackground || Object.entries(checkAccount.Student?.familyBackground).length === 0){
            res.status(400).json({success: false, message: "Need To Finish Account Setup"})
            return
        }

        const getScholarshipsData = await prismaGetScholarship(page, dataPerPage, sortBy, order, status , filters, accountId)
        const meta = {
            counts:{countActive: getScholarshipsData.countActive, countRenew: getScholarshipsData.countRenew, countExpired: getScholarshipsData.countExpired},
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
export const searchScholarship = async (req: Request, res: Response, next: NextFunction): Promise<void>=> {
    try {
        const {page, dataPerPage, sortBy, order, status , filters, search} = (req as Request & {validated:searchScholarshipZodType}).validated.query
        const accountId = Number(req.tokenPayload.accountId)

        const checkAccount = await prismaGetAccountById(accountId)
        if(!checkAccount || checkAccount.role !== "Student"){
            res.clearCookie("token", cookieOptionsStudent);
            res.status(401).json({success: false, message: "Account Did not Find!"})
            return
        }

        const searchedScholarship = await prismaSearchScholarshipTitle(page, dataPerPage, search, sortBy, order, status, accountId)

        const meta = {
            counts:{countActive: searchedScholarship.countActive, countRenew: searchedScholarship.countRenew, countExpired: searchedScholarship.countExpired},
            page: page,
            pageSize: dataPerPage,
            totalRows:searchedScholarship.totalCount,
            totalPage:Math.ceil(searchedScholarship.totalCount/(dataPerPage || searchedScholarship.totalCount)),
            sortBy:sortBy,
            order:order,
            filters:JSON.stringify(filters?.map((f: filtersDataTypes) => f.id))
        }

        res.status(200).json({success: true, searchedScholarship: searchedScholarship.searchResults, meta})
    } catch (error) {
        next(error)
    }
}
export const getScholarshipsbyId = async (req: Request, res: Response, next: NextFunction): Promise<void>=> {
    try {
        const {scholarshipId} = (req as Request & {validated: getScholarshipsByIdZodType}).validated.query
        const accountId = Number(req.tokenPayload.accountId)

        const [checkAccount, isApproved] = await Promise.all([
            prismaGetAccountById(accountId),
            prismaCheckApproveGov(accountId)
        ])
        if(!checkAccount || checkAccount.role !== "Student"){
            res.clearCookie("token", cookieOptionsStudent);
            res.status(401).json({success: false, message: "Account Did not Find!"})
            return
        }
        const inGovScholar = isApproved? true: false
        
        const getScholarshipsById = await prismaGetScholarshipsById(scholarshipId, accountId)
        
        res.status(200).json({success:true, message:"Get Success!", scholarship: getScholarshipsById, inGovScholar});
    } catch (error) {
        next(error)
    }
}
export const applyScholarship = async (req: Request, res: Response, next: NextFunction): Promise<void>=> {
    try {
        const {scholarshipId} = (req as Request & {validated: applyScholarshipZodType}).validated.body
        const accountId = Number(req.tokenPayload.accountId)

        const checkAccount = await prismaGetAccountById(accountId)
        if(!checkAccount || checkAccount.role !== "Student"){
            res.clearCookie("token", cookieOptionsStudent);
            res.status(401).json({success: false, message: "Account Did not Find!"})
            return
        }
        if(!checkAccount.Student?.familyBackground){
            res.status(401).json({success: false, message: "Account Setup still not Finished!"})
            return
        }

        const checkScholarship = await prismaGetScholarshipsById(scholarshipId)
        if(!checkScholarship){
            res.status(400).json({success: false, message: "Scholarship Inactive!"})
            return
        }
        if(new Date(checkScholarship.deadline) < new Date()){
            res.status(400).json({success: false, message: "Scholarship Inactive!"})
            return
        }

        const checkIfInGovScholarship = await prismaCheckApproveGov(accountId)
        if(checkIfInGovScholarship && checkScholarship.type === "government" && checkIfInGovScholarship.Scholarship?.ended === false){
            res.status(400).json({success: false, message: "Already have a Approved Goverment Scholarship"})
            return
        }
        const applicationDuplicate = await prismaCheckApplicationDuplicate(accountId, scholarshipId)
        if(applicationDuplicate){
            res.status(400).json({success: false, message:"You already have an application for this Scholarship!"});
            return
        }

        const phase: string = `phase-${checkScholarship.phase}`
        const rawFileNames: RecordDocumentEntry = (checkScholarship.documents as {[phase]: RecordDocumentEntry})[phase]
        if(!rawFileNames){
            res.status(400).json({success: false, message: "File Requirements Did not Find!"})
            return
        }

        for(const [key, value] of Object.entries(rawFileNames)){
            const check = (req.files as Express.Multer.File[]).find(file => normalizeString(file.fieldname) == normalizeString(value.label))
            if(!check && value.requirementType === "required"){
                res.status(400).json({success: false, message: "File Requirements Did not met!"})
                return
            }
        }

        const applicationFiles: RecordApplicationFilesTypes = {[phase]:[]}
        const supabasePath: string[] = []
        for(const [key, value] of Object.entries(rawFileNames)){
            const upload = (req.files as Express.Multer.File[]).find(file => normalizeString(file.fieldname) == normalizeString(value.label))

            const uploadResult: ResponseUploadSupabasePrivate | undefined = upload? await UploadSupabasePrivate(upload, "student-application-files"):undefined
            applicationFiles[phase].push({
                document: value.label,
                supabasePath:upload && uploadResult? uploadResult.path: "",
                fileFormat:upload? upload.mimetype: "",
                resourceType:upload? upload.mimetype: "",
                requirementType:value.requirementType,
            })
            supabasePath.push(uploadResult? uploadResult.path: "")
        }
        const insertApplication = await prismaCreateApplication(applicationFiles, supabasePath, accountId, scholarshipId)
        if(!insertApplication){
            res.status(500).json({success: false, message:"Server Error!!!"})
            return;
        }
        const inGov = checkAccount.Student?.Application.find(f => f.Scholarship?.type === "government")? true:false
        res.status(200).json({success:true, inGov, application: insertApplication})
        io.to(["ISPSU_Head", "ISPSU_Staff", insertApplication.ownerId.toString()]).emit("applyScholarship", {newApplication: insertApplication, inGov, success: true})
    } catch (error) {
        next(error)
    }
}
export const applyRenewScholarship = async(req: Request, res: Response, next: NextFunction): Promise<void>=> {
    try {
        const {scholarshipId} = (req as Request&{validated: applyScholarshipZodType}).validated.body
        const accountId = Number(req.tokenPayload.accountId)

        const checkAccount = await prismaGetAccountById(accountId)
        if(!checkAccount || checkAccount.role !== "Student"){
            res.clearCookie("token", cookieOptionsStudent);
            res.status(404).json({success: false, message: "Account Did not Find!"})
            return
        }

        const checkScholarship = await prismaGetScholarshipsById(scholarshipId)
        if(!checkScholarship){
            res.status(404).json({success: false, message: "Scholarship Did not Found!"})
            return
        }
        if(new Date(checkScholarship.deadline) < new Date()){
            res.status(400).json({success: false, message: "Scholarship Is Not Active!"})
            return
        }
        
        const checkPrevApplication = await prismaCheckApplicationDuplicate(accountId, scholarshipId)
        if(!checkPrevApplication){
            res.status(400).json({success: false, message: "You Are not Qualified For this Scholarship!"})
            return
        }
        const phase = `phase-${checkScholarship.phase}`
        const documentsNeeded:DocumentEntry[]  = (checkScholarship.documents as {[phase]: DocumentEntry[]})[phase]
        if(!documentsNeeded){
            res.status(400).json({success: false, message: "File Requirements Did not Find!"})
            return
        }
        const renewFiles = checkPrevApplication.submittedDocuments as RecordApplicationFilesTypes
        renewFiles[phase] = []
        const supabasePath:string[] = []
        for(const [key, value] of Object.entries(documentsNeeded)){
            const upload = (req.files as Express.Multer.File[]).find(file => file.fieldname == value.label)
            if(!upload && value.requirementType === "required"){
                res.status(400).json({success: false, message: "File Requirements Did not met!"})
                await SupabaseDeletePrivateFile(supabasePath).catch(error => console.log(error))
                return
            }
            if(upload){
                const uploadResult: ResponseUploadSupabasePrivate = await UploadSupabasePrivate(upload, "student-application-files")
                if(!uploadResult){
                    res.status(500).json({success: false, message: "Upload Fail!"})
                    return
                }
                supabasePath.push(uploadResult.path)
                renewFiles[phase].push({
                    document:value.label,
                    fileFormat:upload.mimetype,
                    resourceType:upload.mimetype,
                    supabasePath:uploadResult.path,
                    requirementType:value.requirementType,
                })
            }
        }
        const allSupabasePath: string[] = [...supabasePath, ...(checkPrevApplication.supabasePath as string[])]
        const renewApplication = await prismaRenewApplication(checkPrevApplication.applicationId, renewFiles, allSupabasePath)
        if(!renewApplication){
            res.status(500).json({success: false, message: "Server Error!"})
            await SupabaseDeletePrivateFile(supabasePath).catch(error => console.log(error))
            return
        }
        const inGov = checkAccount.Student?.Application.find(f => f.Scholarship?.type === "government")? true:false
        res.status(200).json({success: true, message: "Application Submitted!", inGov, newApplication: renewApplication})
        io.to(["ISPSU_Head", "ISPSU_Staff"]).emit("applyRenewScholarship", inGov, {newApplication: renewApplication, success: true})
    } catch (error) {
        next(error)
    }
}
export const tokenValidation = async(req: Request, res: Response, next: NextFunction): Promise<void>=> {
    try {
        const accountId = typeof req.tokenPayload?.accountId === "string"? Number(req.tokenPayload.accountId):req.tokenPayload.accountId
        const userData = await prismaGetAccountById(accountId)
        if(!userData){
            res.clearCookie("token", cookieOptionsStudent);
            res.status(401).json({ success: false, message: "Invalid or expired token" });
            return;
        }
        const {hashedPassword ,...safeData} = userData
        const counts = await prismaStudentCountsInToken(accountId)
        const unreadNotifications = await prismaGetUnreadNotificationsCount(accountId)
        const {ISPSU_StaffCount, ...forStudent} = counts
        res.status(200).json({success: true, userData:safeData, unreadNotifications, ...forStudent})
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
        const {page, dataPerPage, sortBy, order, status, search} = (req as Request & {validated: getAnnouncementsZodType}).validated.query
        const accountId = Number(req.tokenPayload.accountId)

        const checkAccount = await prismaGetAccountById(accountId)
        if(!checkAccount || checkAccount.role !== "Student"){
            res.clearCookie("token", cookieOptionsStudent);
            res.status(401).json({success: false, message: "Account Did not Find!"})
            return
        }

        const annoucement = await prismaGetAllAnnouncement( page, dataPerPage, sortBy, order, status, search)
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
export const getAnnouncementsById = async (req: Request, res: Response, next: NextFunction): Promise<void>=> {
    try {
        const {annoucementId} = (req as Request & {validated: getAnnouncementsByIdZodType}).validated.query
        const accountId = Number(req.tokenPayload.accountId)

        const checkAccount = await prismaGetAccountById(accountId)
        if(!checkAccount || checkAccount.role !== "Student"){
            res.clearCookie("token", cookieOptionsStudent);
            res.status(401).json({success: false, message: "Account Did not Find!"})
            return
        }

        const annoucement = await prismaGetAnnouncementById(annoucementId)
        if(!annoucement){
            res.status(404).json({success: false, message: "Announcement Not Found!"})
            return
        }
        res.status(200).json({success: true, message: "Annoucement Found!", annoucement})
    } catch (error) {
        next(error)
    }
}
export const getNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void>=> {
    try {
        const {page, dataPerPage, status, sortBy, order} = (req as Request & {validated: getNotificationsZodType}).validated.query
        const accountId = Number(req.tokenPayload.accountId)

        const checkAccount = await prismaGetAccountById(accountId)
        if(!checkAccount || checkAccount.role !== "Student"){
            res.clearCookie("token", cookieOptionsStudent);
            res.status(401).json({success: false, message: "Account Did not Find!"})
            return
        }

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
        const {page, dataPerPage, status, order, sortBy, search} = (req as Request & {validated: getApplicationsZodType}).validated.query
        const accountId = Number(req.tokenPayload.accountId)

        const checkAccount = await prismaGetAccountById(accountId)
        if(!checkAccount || checkAccount.role !== "Student"){
            res.clearCookie("token", cookieOptionsStudent);
            res.status(401).json({success: false, message: "Account Did not Find!"})
            return
        }

        const getData = await prismaGetAllAccountApplication(accountId, page, dataPerPage, status, search, order, sortBy)
        
        const meta = {
            counts: getData.counts,
            page: page,
            pageSize: dataPerPage,
            totalRows:getData.totalCount,
            totalPage:Math.ceil(getData.totalCount/(dataPerPage || getData.totalCount)),
            sortBy:"default",
            order:"default",
            filters:"default"
        }
        res.status(200).json({success: true, applications: getData.applications, meta})
    } catch (error) {
        next(error)
    }
}
export const getStudentApplicationById = async (req: Request, res: Response, next: NextFunction): Promise<void>=> {
    try {
        const {applicationId} = (req as Request & {validated: getStudentApplicationByIdZodType}).validated.query
        const accountId = Number(req.tokenPayload.accountId)

        const checkAccount = await prismaGetAccountById(accountId)
        if(!checkAccount || checkAccount.role !== "Student"){
            res.clearCookie("token", cookieOptionsStudent);
            res.status(401).json({success: false, message: "Account Did not Find!"})
            return
        }

        const application = await prismaGetApplication(applicationId)
        if(!application){
            res.status(404).json({success: false, message: "Application Did not Find!"})
            return
        }
        if(application.ownerId !== accountId){
            res.status(400).json({success: false, message: "Application is not yours!"})
            return
        }
        const inGov = checkAccount.Student?.Application.find(f => f.Scholarship?.type === "government")? true:false
        const k: any = {}
        for(const [key, value] of Object.entries(application.submittedDocuments as RecordApplicationFilesTypes)){
            k[key] = {
                documents : value,
                Application_Decision : application.Application_Decision.find(f => `phase-${f.scholarshipPhase}` === key),
                Interview_Decision : application.Interview_Decision.find(f => `phase-${f.scholarshipPhase}` === key)
            }
        }

        res.status(200).json({success: true, inGov, application:{
            applicationId: application.applicationId,
            scholarshipId: application.scholarshipId,
            ownerId: application.ownerId,
            status: application.status,
            supabasePath: application.supabasePath,
            submittedDocuments: k,
            Application_Decision: application.Application_Decision,
            Interview_Decision: application.Interview_Decision,
            Student: application.Student,
            Scholarship: application.Scholarship,
            dateCreated: application.dateCreated,
        }})
    } catch (error) {
        next(error)
    }
}
export const getApplicationHistory = async (req: Request, res: Response, next: NextFunction): Promise<void>=> {
    try {
        const {page, dataPerPage, scholarshipId, status, sortBy, order, filter, search} = (req as Request & {validated: getApplicationHistoryZodType}).validated.query
        const accountId = Number(req.tokenPayload.accountId)

        const checkAccount = await prismaGetAccountById(accountId)
        if(!checkAccount || checkAccount.role !== "Student"){
            res.clearCookie("token", cookieOptionsStudent);
            res.status(401).json({success: false, message: "Account Did not Find!"})
            return
        }

        const applications = await prismaGetApplicationHistory(accountId, page, dataPerPage, scholarshipId, status, sortBy, order, filter, search)
        const meta = {
            counts:applications.counts,
            page: page,
            pageSize: dataPerPage,
            totalRows:applications.totalCount,
            totalPage:Math.ceil(applications.totalCount/(dataPerPage || applications.totalCount)),
            sortBy:sortBy? sortBy:"default",
            order:order? order:"default",
            filters:JSON.stringify(filter?.map((f: filtersDataTypes) => f.id))
        }
        
        res.status(200).json({success: true, meta, applications: applications.applications})
    } catch (error) {
        next(error)
    }
}