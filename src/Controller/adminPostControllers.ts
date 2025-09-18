import { NextFunction, Request, Response } from "express";
import { Prisma, PrismaClient } from "@prisma/client";
import { filtersDataTypes, parsedRequirementsTypes } from "../Types/adminPostControllerTypes";
import { DeleteSupabase, ResponseUploadSupabase, supabase, UploadSupabase } from "../Config/Supabase";
import { adminAddScholarshipsZodType, approveApplicationZodType, archiveScholarshipZodType, createAnnouncementZodType, declineApplicationZodType, deleteAdminZodType, deleteAnnouncementZodType, 
  deleteApplicationsZodType, deleteScholarshipZodType, forInterviewZondType, getAllAdminZodType, getAnnouncementZodType, getApplicationByIdZodType, getApplicationZodType, getFilterDataZodType, 
  getScholarshipsByIdZodType, getScholarshipZodType, renewalScholarshipZodType, searchAdminZodType, searchApplicationZodType, searchScholarshipZodType, updateScholarshipZodType } from "../Zod/ZodSchemaAdminPost";
import { CreateEmailOptions } from "resend";
import { ApproveHTML } from "../utils/HTML-ApprovedApplication";
import { interviewHTML } from "../utils/HTML-InterviewApplication";
import { prismaGetStaffAccounts, prismaSearchISPUStaff, prismaTotalCountStaff } from "../Models/ISPSU_StaffModels";
import { prismaDeleteAccount, prismaGetAccountById } from "../Models/AccountModels";
import { prismaArchiveScholarship, prismaCreateScholarship, prismaDeleteScholarship, prismaFiltersScholarship, prismaGetScholarship, prismaGetScholarshipByArray, prismaGetScholarshipsById, prismaRenewScholarship, prismaSearchScholarshipTitle, prismaSelectValidArchiveScolarship, prismaUpdateScholarship } from "../Models/ScholarshipModels";
import { prismaAcceptForInterview, prismaApproveApplication, prismaBlockApplicationByOwnerId, prismaCheckApproveGov, prismaDeclineApplication, prismaDeleteApplication, prismaGetAllApplication, prismaGetApplication, prismaGetApplicationPath, prismaSearchApplication } from "../Models/ApplicationModels";
import { prismaFiltersStudent } from "../Models/StudentModels";
import { prismaGetApplicationByIdScholarshipId } from "../Models/Application_DecisionModels";
import { prismaCreateAnnouncement, prismaDeleteAnnouncement, prismaGetAllAnnouncement } from "../Models/AnnouncementModels";
import { declineHTML } from "../utils/HTML-DeclinedApplication";
import { chunkArray } from "../utils/Helper";

export const getAllAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void>=> {
  try {
    const {page, dataPerPage, sortBy, accountId, order} = (req as Request & {validated: getAllAdminZodType}).validated.query

    if(!page || !dataPerPage){
      res.status(400).json({success: false, message: "Incomplete Credentials!"})
      return
    }
    const totalAccounts = await prismaTotalCountStaff(accountId)
    const getAdmin  = await prismaGetStaffAccounts(page, dataPerPage, sortBy, accountId, order)
    const meta = {
      page: page,
      pageSize: dataPerPage,
      totalRows:totalAccounts,
      totalPage:Math.ceil(totalAccounts/dataPerPage),
      sortBy:sortBy? sortBy:"default",
      order:order? order:"default",
      filters:JSON.stringify({})
    }
    res.status(200).json({data:getAdmin, meta})
  } catch (error) {
    next(error)
  }
}
export const searchAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void>=>{
  try {
    const {page, dataPerPage, accountId, search, sortBy, order} = (req as Request & {validated: searchAdminZodType}).validated.query

    if(!page || !dataPerPage){
      res.status(400).json({success: false, message: "Incomplete Credentials!"})
      return
    }

    const getSearchAdmin = await prismaSearchISPUStaff(search, page, dataPerPage, sortBy, order, accountId)

    const meta = {
      page: page,
      pageSize: dataPerPage,
      totalRows:getSearchAdmin.totalCount,
      totalPage:Math.ceil(getSearchAdmin.totalCount/dataPerPage),
      sortBy:sortBy? sortBy:"default",
      order:order? order:"default",
      filters:JSON.stringify({})
    }

    res.status(200).json({data: getSearchAdmin.staffAccounts, meta})
  } catch (error) {
    next(error)
  }
}
export const deleteAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void>=> {
  try {
    let {accountId} = (req as Request & {validated: deleteAdminZodType}).validated.body
    
    const deleteAdmin = await prismaDeleteAccount(accountId)

    res.status(200).json({success:true, message:"Admin Accounts Deleted!", affectedRows:deleteAdmin})
  } catch (error) {
    next(error)
  }
}




export const adminAddScholarships = async (req: Request, res: Response, next: NextFunction): Promise<void>=> {
    try {
      const {
        scholarshipType,
        newScholarTitle,
        newScholarProvider,
        newScholarDeadline,
        newScholarDescription,
        scholarshipDocuments,
        scholarshipAmount,
        scholarshipLimit,
        gwa,
        adminId,
        isForInterview,
      } = (req as Request & {validated: adminAddScholarshipsZodType}).validated.body;

      const checkAccount = await prismaGetAccountById(adminId)
      if(!checkAccount){
        res.status(404).json({success: false, message: "Account Did Not Found!"})
        return
      }
      if(checkAccount.role !== "ISPSU_Head"){
        res.status(401).json({success: false, message: "This Account Is not Allowed To Add Scholarship"})
        return
      }
    
      const sponsorLogo = (req.files as Express.Multer.File[]).find(file => file.fieldname === 'sponsorLogo');
      const coverImg = (req.files as Express.Multer.File[]).find(file => file.fieldname === 'coverImg');
      const form = (req.files as Express.Multer.File[]).find(file => file.fieldname === 'scholarshipForm');
      if ( !sponsorLogo || !coverImg || !form ) {
        res.status(422).json({success: false, message: 'Incomplete Image!'});
        return;
      }
  
      const sponsorResult: ResponseUploadSupabase = await UploadSupabase(sponsorLogo, "scholarship-files");
      const coverResult: ResponseUploadSupabase = await UploadSupabase(coverImg, "scholarship-files");
      const formResult: ResponseUploadSupabase = await UploadSupabase(form, "scholarship-files");

      const insertScholarshipsData = await prismaCreateScholarship(
        scholarshipType, newScholarTitle, newScholarProvider,  newScholarDeadline, newScholarDescription,
        scholarshipDocuments, scholarshipAmount, scholarshipLimit, gwa, adminId, 
        sponsorResult, coverResult, formResult, isForInterview
      );
      if(!insertScholarshipsData){
        await DeleteSupabase([sponsorResult.publicUrl, coverResult.publicUrl, formResult.publicUrl])
        res.status(500).json({success: false, message: "Database Error"});
        return;
      }
      res.status(200).json({success: true,message: 'Scholarship Added!'});
    } catch (error) {
      next(error)
    }
}; 

export const getScholarship = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {filters, page, dataPerPage, sortBy, order, status} = (req as Request & {validated: getScholarshipZodType}).validated.query
    if(filters && !Array.isArray(filters)){
      res.status(422).json({success: false, message: "Invalid Array Format!"})
      return
    }
    
    const getScholarshipsData = await prismaGetScholarship(page, dataPerPage, sortBy, order, status , filters);
    const metaFilters: any = {}
    filters?.forEach((element:filtersDataTypes) => {
      metaFilters[element.id] = element.value
    });
    const meta = {
      page: page? page: "none",
      pageSize: dataPerPage? dataPerPage: "none",
      totalRows:getScholarshipsData.totalCount,
      totalPage:Math.ceil(getScholarshipsData.totalCount/(dataPerPage || getScholarshipsData.totalCount)),
      sortBy:sortBy? sortBy:"default",
      order:order? order:"default",
      filters:JSON.stringify(metaFilters)
    }
    res.status(200).json({data:getScholarshipsData.scholarship, meta});
  } catch (error) {
    next(error)
  }
}

export const searchScholarship = async (req: Request, res: Response, next: NextFunction): Promise<void>=> {
  try {
    const {status, search, page, dataPerPage, sortBy, order} = (req as Request & {validated: searchScholarshipZodType}).validated.query

    const dataSearch = await prismaSearchScholarshipTitle(page, dataPerPage, search, sortBy, order, status)
    const meta = {
      page: page,
      pageSize: dataPerPage,
      totalRows:dataSearch.totalCount,
      totalPage:Math.ceil(dataSearch.totalCount/(dataPerPage || dataSearch.totalCount)),
      sortBy:sortBy? sortBy:"default",
      order:order? order:"default",
      filters:JSON.stringify({
      })
    }
    res.status(200).json({success: true, data:dataSearch.searchResults, meta})
  } catch (error) {
    next(error)
  }
}

export const getScholarshipsById = async (req: Request, res: Response, next: NextFunction): Promise<void>=> {
  try {
    const {scholarshipId} = (req as Request & {validated: getScholarshipsByIdZodType}).validated.query
      const getScholarshipsByIdData = await prismaGetScholarshipsById(scholarshipId);
      if(!getScholarshipsByIdData){
        res.status(404).json({success: false, message: "Scholarship Did not Found!!!"});
        return;
      }
      res.status(200).json({success:true, message:"Get Success!", scholarship: getScholarshipsByIdData});
  } catch (error) {
      next(error)
  }
}

export const updateScholarship = async (req: Request, res: Response, next: NextFunction): Promise<void>=> {
  try {
    const {
      scholarshipId,
      newScholarProvider,
      newScholarTitle,
      newScholarDeadline,
      newScholarDescription,
      scholarshipAmount,
      scholarshipLimit,
      gwa,
      scholarshipDocuments,
      accountId
    } = (req as Request & {validated: updateScholarshipZodType}).validated.body;

    const checkAccount = await prismaGetAccountById(accountId)
    if(!checkAccount){
      res.status(404).json({success: false, message: "Account Did Not Found!"})
      return
    }
    if(checkAccount.role !== "ISPSU_Head"){
      res.status(401).json({success: false, message: "This Account Is not Allowed To Update Scholarship"})
      return
    }
    const scholarship = await prismaGetScholarshipsById(scholarshipId)
    if(!scholarship){
      res.status(404).json({success: false, message: "Scholarship Did no Found!"})
      return
    }
    const newSupabasePath = {
      ...((scholarship as {supabasePath: {[k: string]: string}}).supabasePath),
    }
    const deleteOldFiles: string[] = []

    let scholarshipLogo: any = (req.files as Express.Multer.File[]).find(file => file.fieldname === 'sponsorLogo');
    let scholarshipCover: any = (req.files as Express.Multer.File[]).find(file => file.fieldname === 'coverImg');
    let scholarshipForm: any = (req.files as Express.Multer.File[]).find(file => file.fieldname === 'scholarshipForm');

    if(scholarshipLogo){
      scholarshipLogo = await UploadSupabase(scholarshipLogo, "scholarship-files")
      deleteOldFiles.push(newSupabasePath.logo)
      newSupabasePath.logo = scholarshipLogo.path
    }
    if(scholarshipCover){
      scholarshipCover = await UploadSupabase(scholarshipCover, "scholarship-files")
      deleteOldFiles.push(newSupabasePath.cover)
      newSupabasePath.cover = scholarshipCover.path
    }
    if(scholarshipForm){
      scholarshipForm = await UploadSupabase(scholarshipForm, "scholarship-files")
      deleteOldFiles.push(newSupabasePath.form)
      scholarshipForm.form = scholarshipForm.path
    }

    const update = await prismaUpdateScholarship(
      scholarshipId,
      newScholarProvider,
      newScholarTitle,
      newScholarDeadline,
      scholarshipAmount,
      newScholarDescription,
      scholarshipDocuments,
      scholarshipLimit,
      gwa,
      scholarshipLogo,
      scholarshipCover,
      scholarshipForm,
      newSupabasePath
    )
    if(!update){
      if(scholarshipLogo){
        await DeleteSupabase([scholarshipLogo.path])
      }
      if(scholarshipCover){
        await DeleteSupabase([scholarshipCover.path])
      }
      if(scholarshipForm){
        await DeleteSupabase([scholarshipForm.path])
      }
    }
    await DeleteSupabase(deleteOldFiles)
    res.status(200).json({success: true, message: "Scholarship Updated!"})
  } catch (error) {
    next(error);
  }
}

export const renewalScholarship = async (req: Request, res: Response, next: NextFunction): Promise<void>=> {
  try {
    const {accountId, scholarshipId, newRequirements} = (req as Request & {validated: renewalScholarshipZodType}).validated.body

    const checkAccount = await prismaGetAccountById(accountId)
    if(!checkAccount){
      res.status(404).json({success: false, message: "Account Did Not Found!"})
      return
    }
    if(checkAccount.role !== "ISPSU_Head"){
      res.status(401).json({success: false, message: "This Account Is not Allowed To Renew Scholarship"})
      return
    }
    const scholarship = await prismaGetScholarshipsById(scholarshipId)
    if(!scholarship){
      res.status(404).json({success: false, message: "Scholarship Did Not Find!"})
      return
    }
    const deadline = new Date(scholarship.deadline);
    if (isNaN(deadline.getTime())) {
      res.status(400).json({ success: false, message: "Invalid scholarship deadline!" });
      return;
    }
    if(deadline > new Date()){
      res.status(409).json({success: false, message: "Scholarship Is Currently Active!"})
      return
    }
    
    const updatedRequirements: object = {...(scholarship.documents as Record<string, unknown>||{documents:{}}),renewDocuments:newRequirements}
    const renewScholar = await prismaRenewScholarship(accountId, scholarshipId, updatedRequirements)
    if(!renewScholar){
      res.status(500).json({success: false, message: "Server Error!"})
      return
    }
    res.status(200).json({success: false, message: "Scholarship Renewed!"})
  } catch (error) {
    next(error)
  }
}

export const archiveScholarship = async (req: Request, res: Response, next: NextFunction): Promise<void>=> {
  try {
    const {accountId, scholarshipId} = (req as Request &{validated: archiveScholarshipZodType}).validated.body
    if(!Array.isArray(scholarshipId.data) || (scholarshipId.data as unknown[]).every(element => typeof element === "number")){
      res.status(422).json({success: false, message: "Invalid Array Format!"})
      return
    }

    const checkAccount = await prismaGetAccountById(accountId)
    const checkScholarship = await prismaGetScholarshipByArray(scholarshipId.data)
    if(!checkAccount || !checkScholarship){
      res.status(404).json({success: false, message: "Data Did Not Found!"})
      return
    }
    if(checkAccount.role !== "ISPSU_Head"){
      res.status(401).json({success: false, message: "This Account Is not Allowed To Archive Scholarship"})
      return
    }

    const archiveScholarship = await prismaSelectValidArchiveScolarship(scholarshipId.data)
    
    if(!archiveScholarship){
      res.status(500).json({success: false, message: "Server Error!"})
      return
    }
    res.status(200).json({success: true, message: "Scholarship Archived!"})
  } catch (error) {
    next(error)
  }
}

export const deleteScholarship = async (req: Request, res: Response, next: NextFunction): Promise<void>=>{
  try {
    const {accountId, scholarshipId} = (req as Request & {validated: deleteScholarshipZodType}).validated.body

    const checkAccount = await prismaGetAccountById(accountId)
    if(!checkAccount){
      res.status(404).json({success: false, message: "Account Did Not Found!"})
      return
    }
    if(checkAccount.role !== "ISPSU_Head"){
      res.status(401).json({success: false, message: "This Account Is not Allowed To Delete Scholarship"})
      return
    }
    const scholarship = await prismaGetScholarshipByArray(scholarshipId)
    if(!scholarship){
      res.status(404).json({success: false, message:"Scholarship Did Not Find!"})
      return
    }
    const deleteData: string[] = Object.values(scholarship.supabasePath as {})
    const DeleteScholarship = await prismaDeleteScholarship(scholarshipId);
    if(!DeleteScholarship){
      res.status(401).json({success: false, message: "The Scholarship is Already Deleted!!"});
      return;
    }
    await DeleteSupabase(deleteData)
    res.status(200).json({success: true, message: "Scholarship Deleted!!"})

    const applicationIDs: {id: number, supabasePath: {[key: string]: string}}[] = scholarship.Application.map(e => ({id:e.applicationId, supabasePath:e.supabasePath as {[key: string]: string}}))
    const batchIDs = chunkArray(applicationIDs, 20)
    const prisma = new PrismaClient()
    
    for(let i = 0; i < batchIDs.length; i++){
      const batch = batchIDs[i]

      await Promise.all(batch.map(async (app)=> {
        await prisma.application.delete({
          where:{
            applicationId: app.id
          }
        })
        await DeleteSupabase(Object.values(app.supabasePath))
      }))
    }
  } catch (error) {
    next(error)
  }
}



export const getApplicationById = async (req: Request, res: Response, next: NextFunction): Promise<void>=> {
  try {
    const {applicationId} = (req as Request & {validated: getApplicationByIdZodType}).validated.query
    const getData = await prismaGetApplication(applicationId)
    if(!getData){
      res.status(400).json({success: false, message: "Data Did not found"})
      return
    }
    const {} = getData
    res.status(200).json({success: true, data: getData})
  } catch (error) {
    next(error)
  }
}

export const searchApplication = async (req: Request, res: Response, next: NextFunction): Promise<void>=> {
  try {
    const {search, status, sortBy, order, page, dataPerPage} = (req as Request & {validated: searchApplicationZodType}).validated.query

    const allowedStatusFilter = ["DECLINED", "PENDING", "APPROVED"]

    const searchedApplication = await prismaSearchApplication(search, status, sortBy, order, page, dataPerPage)
    
    const meta = {
      page: page,
      pageSize: dataPerPage,
      totalRows: searchedApplication.totalCount,
      totalPage: Math.ceil(searchedApplication.totalCount / (dataPerPage ? dataPerPage : searchedApplication.totalCount)),
      sortBy: sortBy ? sortBy : "default",
      order: order ? order : "default",
      filters: JSON.stringify({
        ...(status && allowedStatusFilter.includes(status) ? { status: status } : undefined),
      })
    }
    res.status(200).json({ data: searchedApplication.applications, meta})
  } catch (error) {
    next(error)
  }
}

export const getFilterData = async (req: Request, res: Response, next: NextFunction): Promise<void>=> {
  try {
    const {scholarshipStatus, applicationStatus} = (req as Request & {validated: getFilterDataZodType}).validated.query
    
    const getScholarshipsFilters = await prismaFiltersScholarship(scholarshipStatus)
    const getFilterData = await prismaFiltersStudent(applicationStatus)

    res.status(200).json({getFilterData, getScholarshipsFilters})//{optionsScholarship, optionsApplication}
  } catch (error) {
    next(error)
  }
}

export const approveApplication = async (req: Request, res: Response, next: NextFunction): Promise<void>=> {
  try {
    const {applicationId, adminId, scholarshipId} = (req as Request & {validated: approveApplicationZodType}).validated.body

    const validStaff = await prismaGetAccountById(adminId)
    if(!validStaff){
      res.status(404).json({success: false, message: "Staff Did not Find!"})
      return
    }
    if(validStaff.role !== "ISPSU_Staff"){
      res.status(401).json({success: false, message: "This Account is Not Staff!"})
      return
    }
    const checkApplication = await prismaGetApplicationByIdScholarshipId(applicationId,scholarshipId)
    if(!checkApplication){
      res.status(404).json({success: false, message:"Application Did not Find"})
      return
    }
    if(!checkApplication.scholarshipId){
      res.status(404).json({success: false, message: "Scholarship Did not Find"})
      return
    }
    if(["APPROVED", "DECLINED", "BLOCKED"].includes(checkApplication.status)){
      res.status(409).json({success: false, message: "Application Already Approved/Declined!"})
      return
    }
    const scholarship = await prismaGetScholarshipsById(scholarshipId)
    if(!scholarship){
      res.status(404).json({success: false, message: "Scholarship Did No Find!"})
      return
    }
    if(scholarship.interview === true && checkApplication.status !== "INTERVIEW"){
      res.status(409).json({success: false, message: "This Student is Not Interviewed Yet!"})
      return
    }
    const checkApproveGov = await prismaCheckApproveGov(checkApplication.ownerId)
    if(checkApproveGov && scholarship.type === "government"){
      res.status(409).json({success: false, message: "This Student already have a Government Scholarship!"})
      await prismaDeleteApplication([applicationId])
      const removeFiles = await DeleteSupabase(Object.values(checkApproveGov.supabasePath as {[key: string]: string}))
      return
    }

    const approve = await prismaApproveApplication(applicationId,adminId)
    if(!approve){
      res.status(500).json({success: false, message: "Server Error!"})
      return
    }
    const student = await prismaGetAccountById(approve.ownerId)
    const applicantName: string = `${student?.Student?.lName}, ${student?.Student?.fName} ${student?.Student?.mName}`
    const applicantStudentId: string = `${student?.schoolId}`
    const applicantEmail: string = `${student?.email}`
    const mailOptions: CreateEmailOptions = {
      from:"service@edugrant.online",
      to:student?.email || "",
      subject:"Approved Application",
      html:ApproveHTML(applicantName, applicantStudentId, applicantEmail),
    }
    // sendApplicationUpdate(mailOptions)
    res.status(200).json({success: true, message: "Application Approved!"})
  } catch (error: any) {
    if(error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034"){
      res.status(409).json({success: false, message: "This Application Has Been Processed!"})
      return
    }
    if(error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034"){
      res.status(409).json({success: false, message: "This Application Has Been Processed!"})
      return
    }
    next(error)
  }
}

export const forInterview = async (req: Request, res: Response, next: NextFunction): Promise<void>=> {
  try {
    const {applicationId, scholarshipId, accountId} = (req as Request &{validated: forInterviewZondType}).validated.body

    const checkApplication = await prismaGetApplicationByIdScholarshipId(applicationId, scholarshipId)
    if(!checkApplication){
      res.status(404).json({success: false, message: "Application Did not Find!"})
      return
    }
    if(["INTERVIEW", "DECLINED", "BLOCKED", "APPROVED"].includes(checkApplication.status)){
      res.status(409).json({success: false, message: `Application Is Already ${checkApplication.status}`})
      return
    }
    const checkScholarship = await prismaGetScholarshipsById(scholarshipId)
    if(!checkScholarship){
        res.status(404).json({success: false, message: "This Sholarship No Longet Exist"})
        return
    }
    if(checkScholarship.interview === false){
      res.status(409).json({success: false, message: "This Sholarship Does not Required Interview!"})
      return
    }
    const validStaff = await prismaGetAccountById(accountId)
    if(!validStaff){
      res.status(404).json({success: false, message: "Staff Did not Find!"})
      return
    }
    if(validStaff.role !== "ISPSU_Staff"){
      res.status(401).json({success: false, message: "This Account is Not Staff!"})
      return
    }

    const setInterview = await prismaAcceptForInterview(applicationId, accountId)
    if(!setInterview){
      res.status(500).json({success: false, message: "Server Error!"})
      return
    }
    const student = await prismaGetAccountById(setInterview.ownerId)
    const applicantName: string = `${student?.Student?.lName}, ${student?.Student?.fName} ${student?.Student?.mName}`
    const applicantStudentId: string = `${student?.schoolId}`
    const applicantEmail: string = `${student?.email}`
    const mailOptions: CreateEmailOptions = {
      from:"service@edugrant.online",
      to:student?.email || "",
      subject:"Approved Application",
      html:interviewHTML(applicantName, applicantStudentId, applicantEmail),
    }
    // sendApplicationUpdate(mailOptions)
    res.status(200).json({success: true, message: "Application Is now For Interview!"})
  } catch (error) {
    next(error)
  }
}

export const declineApplication = async (req: Request, res: Response, next: NextFunction): Promise<void>=> {
  try {
    const {applicationId, scholarshipId, adminId, rejectMessage} = (req as Request & {validated: declineApplicationZodType}).validated.body

    const checkApplication = await prismaGetApplicationByIdScholarshipId(applicationId, scholarshipId)
    if(!checkApplication){
      res.status(404).json({success: false, message:"Application Did not Find"})
      return
    }
    if(!["PENDING", "INTERVIEW", "BLOCKED"].includes(checkApplication.status)){
      res.status(404).json({success: false, message: "Application Already Approved/Declined!"})
      return
    }
    const validStaff = await prismaGetAccountById(adminId)
    if(!validStaff){
      res.status(404).json({success: false, message: "Staff Did not Find!"})
      return
    }
    if(validStaff.role !== "ISPSU_Staff"){
      res.status(401).json({success: false, message: "This Account is Not Staff!"})
      return
    }

    const declineApplication = await prismaDeclineApplication(applicationId, adminId, rejectMessage)
    if(!declineApplication){
      res.status(500).json({success: false, message: "Server Error"})
      return
    }
    const student = await prismaGetAccountById(declineApplication.Student.studentId)
    const applicantName: string = `${student?.Student?.fName}, ${student?.Student?.lName} ${student?.Student?.mName}`
    const applicantStudentId: string = `${student?.schoolId}`
    const applicantEmail: string = `${student?.email}`
    const mailOptions: CreateEmailOptions = {
      from:"service@edugrant.online",
      to:student?.email || "",
      subject:"Approved Application",
      html:declineHTML(applicantName, applicantStudentId, applicantEmail),
    }
    // sendApplicationUpdate(mailOptions)
    res.status(200).json({success: true, message: "Application Declined!"})
  } catch (error) {
    if(error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034"){
      res.status(409).json({success: false, message: "This Application Has Been Processed!"})
      return
    }
    next(error)
  }
}

export const getApplication = async (req: Request, res: Response, next: NextFunction): Promise<void>=> {
  try {
    const {status, page, dataPerPage, sortBy, order, filter, scholarshipId} = (req as Request & {validated: getApplicationZodType}).validated.query
    
    const getApplication = await prismaGetAllApplication(status, page, dataPerPage, sortBy, order, filter, scholarshipId)
    const meta = {
      page: page,
      pageSize: dataPerPage,
      totalRows:getApplication.totalCount,
      totalPage:Math.ceil(getApplication.totalCount/(dataPerPage? dataPerPage: getApplication.totalCount)),
      sortBy:sortBy? sortBy:"default",
      order:order? order:"default",
      filters:JSON.stringify(filter?.map(data => data.id))
    }
    res.status(200).json({success: true, data: getApplication.applications.flat(3), meta})
    return
  } catch (error) {
    next(error)
  }
}

export const deleteApplications = async (req: Request, res: Response, next: NextFunction): Promise<void>=> {
  try {
    const {applicationId} = (req as Request & {validated: deleteApplicationsZodType}).validated.body
    
    if(!Array.isArray(applicationId)){
      res.status(400).json({success: false, message: "Invalid Format!"})
      return
    }

    const applicationImages: Array<{[key: string]: {[key: string]: string}}> = await prismaGetApplicationPath(applicationId)

    let SupabasePaths: Array<string> = []

    applicationImages.forEach(element => {
      if(Array.isArray(element.supabasePath)){
        SupabasePaths = SupabasePaths.concat(element.supabasePath)
      }
    })
    
    const deleteApplications = await prismaDeleteApplication(applicationId)
    if(!deleteApplications){
      res.status(500).json({success: false, message: "Server Error!"})
      return
    }
    await DeleteSupabase(SupabasePaths)
    res.status(200).json({success: true, message: "Applications Deleted!", affectedRows:deleteApplications})
  } catch (error) {
    next(error)
  }
}

export const createAnnouncement = async (req: Request, res: Response, next: NextFunction): Promise<void>=> {
  try {
    const {adminId, announcementTitle, announcementDescription, announcementTags} = (req as Request & {validated: createAnnouncementZodType}).validated.body
    if(!Array.isArray(announcementTags.data)){
      res.status(422).json({success: false, message:"Invalid Array Format!"})
      return
    }
    
    const newAnnouncement = await prismaCreateAnnouncement(adminId, announcementTitle, announcementDescription, announcementTags)
    if(!newAnnouncement){
      res.status(500).json({success: false, message:"Database Error!"})
      return
    }
    res.status(201).json({success: true, message: "Announcement Created!"})
  } catch (error) {
    next(error)
  }
}

export const getAnnouncement = async (req: Request, res: Response, next: NextFunction): Promise<void>=> {
  try {
    const {page, dataPerPage, sortBy, order, status} = (req as Request & {validated: getAnnouncementZodType}).validated.query
    const getData = await prismaGetAllAnnouncement(page, dataPerPage, sortBy, order, status)

    const meta = {
      page: page,
      pageSize: dataPerPage,
      totalRows:getData.totalCount,
      totalPage:Math.ceil(getData.totalCount/(dataPerPage || getData.totalCount)),
      sortBy:sortBy? sortBy:"default",
      order:order? order:"default",
      filters:JSON.stringify({})
    }

    res.status(200).json({announcements:getData.announcements, meta})
  } catch (error) {
    next(error)
  }
}
export const deleteAnnouncement = async (req: Request, res: Response, next:NextFunction): Promise<void>=> {
  try {
    const {announcementId} = (req as Request & {validated: deleteAnnouncementZodType}).validated.body
    if(!Array.isArray(announcementId.data)){
      res.status(422).json({success: false, message: "Invalid string[] Format!"})
      return
    }
    const deleteAnnouncement = await prismaDeleteAnnouncement(announcementId.data)
      if(!deleteAnnouncement){
        res.status(500).json({success: false, message:"Server Error!"})
        return
      }
      res.status(200).json({success: true, message:"Announcement Deleted!"})
  } catch (error) {
    next(error)
  }
}