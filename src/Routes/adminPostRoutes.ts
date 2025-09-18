import { Router } from "express";
import upload from "../Config/upload";
import { getAllAdmin, adminAddScholarships, getScholarship, searchScholarship, updateScholarship, deleteScholarship, 
    searchApplication, getApplicationById, getFilterData, approveApplication, declineApplication, getApplication, 
    searchAdmin, deleteAdmin,
    deleteApplications,
    createAnnouncement,
    getAnnouncement,
    deleteAnnouncement,
    getScholarshipsById,
    forInterview,
    renewalScholarship,
    archiveScholarship,
    } from "../Controller/adminPostControllers";
import { AdminTokenAuth } from "../Config/TokenAuth";
import { adminAddScholarshipsZodSchema, approveApplicationZodSchema, archiveScholarshipZodSchema, createAnnouncementZodSchema, declineApplicationZodSchema, deleteAdminZodSchema, deleteAnnouncementZodSchema, 
    deleteApplicationsZodSchema, deleteScholarshipZodSchema, forInterviewZodSchema, getAllAdminZodSchema, getAnnouncementZodSchema, getApplicationByIdZodSchema, getApplicationZodSchema, 
    getFilterDataZodSchema, getScholarshipsByIdZodSchema, getScholarshipZodSchema, renewalScholarshipZodSchema, searchAdminZodSchema, searchApplicationZodSchema, 
    searchScholarshipZodSchema, updateScholarshipZodSchema } from "../Zod/ZodSchemaAdminPost";
import { validate } from "../Zod/Validator";

const AdminPostRoutes = Router();

AdminPostRoutes.use(AdminTokenAuth);
//admin
AdminPostRoutes.post("/deleteAdmin", validate(deleteAdminZodSchema), deleteAdmin)

AdminPostRoutes.get("/getAllAdmin", validate(getAllAdminZodSchema), getAllAdmin)
AdminPostRoutes.get("/searchAdmin", validate(searchAdminZodSchema), searchAdmin)
//application
AdminPostRoutes.post("/approveApplication", validate(approveApplicationZodSchema), approveApplication)
AdminPostRoutes.post("/forInterview", validate(forInterviewZodSchema), forInterview)
AdminPostRoutes.post("/declineApplication", validate(declineApplicationZodSchema), declineApplication)
AdminPostRoutes.post("/deleteApplications", validate(deleteApplicationsZodSchema), deleteApplications)

AdminPostRoutes.get("/getApplicationById", validate(getApplicationByIdZodSchema), getApplicationById)
AdminPostRoutes.get("/getApplication", validate(getApplicationZodSchema), getApplication)
AdminPostRoutes.get("/searchApplication", validate(searchApplicationZodSchema), searchApplication)
//scholarschips
AdminPostRoutes.post("/adminAddScholarships", upload.any(), validate(adminAddScholarshipsZodSchema), adminAddScholarships)
AdminPostRoutes.put("/updateScholarship", upload.any(), validate(updateScholarshipZodSchema), updateScholarship)
AdminPostRoutes.post("/renewalScholarship", validate(renewalScholarshipZodSchema),renewalScholarship)
AdminPostRoutes.post("/archiveScholarship", validate(archiveScholarshipZodSchema), archiveScholarship)
AdminPostRoutes.post("/deleteScholarship", validate(deleteScholarshipZodSchema),deleteScholarship)

AdminPostRoutes.get("/getScholarship", validate(getScholarshipZodSchema), getScholarship)
AdminPostRoutes.get("/getScholarshipsById", validate(getScholarshipsByIdZodSchema), getScholarshipsById)
AdminPostRoutes.get("/searchScholarship", validate(searchScholarshipZodSchema), searchScholarship)
AdminPostRoutes.get("/getFilterData", validate(getFilterDataZodSchema), getFilterData)

//announcements
AdminPostRoutes.post("/createAnnouncement", validate(createAnnouncementZodSchema), createAnnouncement)
AdminPostRoutes.post("/deleteAnnouncement", validate(deleteAnnouncementZodSchema), deleteAnnouncement)

AdminPostRoutes.get("/getAnnouncement", validate(getAnnouncementZodSchema),getAnnouncement)


export default AdminPostRoutes;