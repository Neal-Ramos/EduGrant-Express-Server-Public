import { Router } from "express";
import upload from "../Config/upload";
import { getAllAdmin, adminAddScholarships, getScholarship, updateScholarship, deleteScholarship, 
    searchApplication, getApplicationById, getFilterData, approveApplication, declineApplication, getApplication, 
    searchAdmin, deleteAdmin, deleteApplications, createAnnouncement, getAnnouncement, deleteAnnouncement, getScholarshipsById, forInterview,
    renewalScholarship, getDashboard, headDashboard, getAnnouncementById, editAnnouncement, getStaffLogs, getStaffById, updateStudentAccount,
    deleteStudent, getStudents, getStudentsById, searchStudent, getFiltersCSV, downloadApplicationCSV, adminTokenAuthentication,
    downloadStudentsCSV, getFiltersStudentsCSV,endScholarship, validateStaff, getFileUrl, downloadApplicationFile, createISPSUStaffAccount, } from "../Controller/adminPostControllers";
import { AdminTokenAuth } from "../Config/TokenAuth";
import { adminAddScholarshipsZodSchema, approveApplicationZodSchema, createAnnouncementZodSchema, declineApplicationZodSchema, deleteAdminZodSchema, deleteAnnouncementZodSchema, 
    deleteApplicationsZodSchema, deleteScholarshipZodSchema, deleteStudentZodSchema, downloadApplicationCSVZodSchema, downloadStudentsCSVZodSchema, editAnnouncementZodSchema, endScholarshipZodSchema, forInterviewZodSchema, getAllAdminZodSchema, getAnnouncementByIdZodSchema, getAnnouncementZodSchema, getApplicationByIdZodSchema, getApplicationZodSchema, 
    getFilterDataZodSchema, getScholarshipsByIdZodSchema, getScholarshipZodSchema, getStaffByIdZodSchema, getStaffLogsZodSchema, getStudentsByIdZodSchema, getStudentsZodSchema, renewalScholarshipZodSchema, searchAdminZodSchema, searchApplicationZodSchema, 
    searchStudentZodSchema, updateScholarshipZodSchema, 
    updateStudentAccountZodSchema,
    validateStaffZodSchema} from "../Zod/ZodSchemaAdminPost";
import { validate } from "../Zod/Validator";
import { downloadApplicationFileZodSchema, getFileUrlZodSchema } from "../Zod/ZodSchemaUserUser";
import { createAccountZodSchema } from "../Zod/ZodSchemanAdminAuth";

const AdminPostRoutes = Router();

AdminPostRoutes.use(AdminTokenAuth);
//admin
AdminPostRoutes.post("/deleteAdmin", validate(deleteAdminZodSchema), deleteAdmin)
AdminPostRoutes.post("/createAccount", validate(createAccountZodSchema), createISPSUStaffAccount);
AdminPostRoutes.post("/validateStaff", validate(validateStaffZodSchema), validateStaff)

AdminPostRoutes.get("/adminTokenAuthentication", adminTokenAuthentication)
AdminPostRoutes.get("/getDashboard", getDashboard)
AdminPostRoutes.get("/headDashboard", headDashboard)
AdminPostRoutes.get("/getAllAdmin", validate(getAllAdminZodSchema), getAllAdmin)
AdminPostRoutes.get("/searchAdmin", validate(searchAdminZodSchema), searchAdmin)
AdminPostRoutes.get("/getStaffById", validate(getStaffByIdZodSchema), getStaffById)
//application
AdminPostRoutes.post("/approveApplication", validate(approveApplicationZodSchema), approveApplication)
AdminPostRoutes.post("/forInterview", validate(forInterviewZodSchema), forInterview)
AdminPostRoutes.post("/declineApplication", validate(declineApplicationZodSchema), declineApplication)
AdminPostRoutes.post("/deleteApplications", validate(deleteApplicationsZodSchema), deleteApplications)
AdminPostRoutes.post("/getFileUrl", validate(getFileUrlZodSchema), getFileUrl)
AdminPostRoutes.post("/downloadApplicationFile", validate(downloadApplicationFileZodSchema), downloadApplicationFile)

AdminPostRoutes.get("/getApplicationById", validate(getApplicationByIdZodSchema), getApplicationById)
AdminPostRoutes.get("/getApplication", validate(getApplicationZodSchema), getApplication)
AdminPostRoutes.get("/searchApplication", validate(searchApplicationZodSchema), searchApplication)
//scholarschips
AdminPostRoutes.post("/adminAddScholarships", upload.any(), validate(adminAddScholarshipsZodSchema), adminAddScholarships)
AdminPostRoutes.put("/updateScholarship", upload.any(), validate(updateScholarshipZodSchema), updateScholarship)
AdminPostRoutes.post("/renewScholarship", validate(renewalScholarshipZodSchema),renewalScholarship)
AdminPostRoutes.post("/endScholarship", validate(endScholarshipZodSchema),endScholarship)
AdminPostRoutes.post("/deleteScholarship", validate(deleteScholarshipZodSchema),deleteScholarship)

AdminPostRoutes.get("/getScholarship", validate(getScholarshipZodSchema), getScholarship)
AdminPostRoutes.get("/getScholarshipsById", validate(getScholarshipsByIdZodSchema), getScholarshipsById)
AdminPostRoutes.get("/getFilterData", validate(getFilterDataZodSchema), getFilterData)

//announcements
AdminPostRoutes.post("/createAnnouncement", validate(createAnnouncementZodSchema), createAnnouncement)
AdminPostRoutes.post("/deleteAnnouncement", validate(deleteAnnouncementZodSchema), deleteAnnouncement)
AdminPostRoutes.post("/editAnnouncement", validate(editAnnouncementZodSchema), editAnnouncement)

AdminPostRoutes.get("/getAnnouncement", validate(getAnnouncementZodSchema),getAnnouncement)
AdminPostRoutes.get("/getAnnouncementById", validate(getAnnouncementByIdZodSchema), getAnnouncementById)

//logs
AdminPostRoutes.get("/getStaffLogs", validate(getStaffLogsZodSchema), getStaffLogs)

//students
AdminPostRoutes.post("/updateStudentAccount", validate(updateStudentAccountZodSchema), updateStudentAccount)
AdminPostRoutes.post("/deleteStudent", validate(deleteStudentZodSchema), deleteStudent)

AdminPostRoutes.get("/getStudents", validate(getStudentsZodSchema), getStudents)
AdminPostRoutes.get("/getStudentsById", validate(getStudentsByIdZodSchema), getStudentsById)
AdminPostRoutes.get("/searchStudent", validate(searchStudentZodSchema), searchStudent)

//CSV
AdminPostRoutes.get("/getFiltersCSV", getFiltersCSV)
AdminPostRoutes.get("/downloadApplicationCSV", validate(downloadApplicationCSVZodSchema), downloadApplicationCSV)
AdminPostRoutes.get("/getFiltersStudentsCSV", getFiltersStudentsCSV)
AdminPostRoutes.get("/downloadStudentsCSV", validate(downloadStudentsCSVZodSchema), downloadStudentsCSV)

export default AdminPostRoutes;